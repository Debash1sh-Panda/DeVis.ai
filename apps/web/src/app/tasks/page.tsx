'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useTasksRealtime } from '@/hooks/use-tasks-realtime';
import { resolveWebIntent } from '@/lib/intent-resolver';

interface TaskStep {
  id: string;
  stepNumber: number;
  toolName: string;
  outputJson?: any;
  status: string;
}

interface TaskItem {
  id: string;
  inputText: string;
  inputType: 'TEXT' | 'VOICE';
  status: 'CREATED' | 'QUEUED' | 'PLANNING' | 'EXECUTING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  steps?: TaskStep[];
}

type TimeBucketKey = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'older';

const BUCKET_CONFIG: Record<TimeBucketKey, { label: string; badge: string }> = {
  today: { label: 'Today', badge: 'bg-primary/10 text-primary border-primary/30' },
  yesterday: { label: 'Yesterday', badge: 'bg-primary-blue/10 text-primary-blue border-primary-blue/30' },
  this_week: { label: 'This Week', badge: 'bg-primary-purple/10 text-primary-purple border-primary-purple/30' },
  this_month: { label: 'This Month', badge: 'bg-surface-elevated text-text-secondary border-border' },
  older: { label: 'Older Tasks', badge: 'bg-surface-input text-text-muted border-border' },
};

function getTaskTimeBucket(dateStr: string): TimeBucketKey {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - 7);

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfToday) {
    return 'today';
  } else if (date >= startOfYesterday) {
    return 'yesterday';
  } else if (date >= startOfThisWeek) {
    return 'this_week';
  } else if (date >= startOfThisMonth) {
    return 'this_month';
  } else {
    return 'older';
  }
}

function extractTargetUrl(task: TaskItem): string | null {
  if (task.steps && task.steps.length > 0) {
    for (const s of task.steps) {
      if (s.outputJson?.targetUrl) return s.outputJson.targetUrl;
      if (s.outputJson?.url) return s.outputJson.url;
    }
  }
  const intent = resolveWebIntent(task.inputText || '');
  return intent.targetUrl;
}

export default function TasksPage() {
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getAll();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time WebSocket event connection (Socket.io)
  // Zero polling needed: task.created, task.started, task.completed, and task.deleted stream instantly!
  useTasksRealtime(user?.id, setTasks as any);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeletingId(id);
    try {
      await tasksApi.delete(id);
      // Optimistic update
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await tasksApi.cancel(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to cancel task:', err);
    }
  };

  // Filter and search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (filter === 'active') {
        if (!['CREATED', 'QUEUED', 'PLANNING', 'EXECUTING', 'WAITING_APPROVAL'].includes(task.status)) {
          return false;
        }
      } else if (filter === 'completed') {
        if (task.status !== 'COMPLETED') return false;
      } else if (filter === 'failed') {
        if (task.status !== 'FAILED') return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          task.inputText.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, filter, search]);

  // Group into time buckets: today, yesterday, this_week, this_month, older
  const groupedTasks = useMemo(() => {
    const buckets: Record<TimeBucketKey, TaskItem[]> = {
      today: [],
      yesterday: [],
      this_week: [],
      this_month: [],
      older: [],
    };

    for (const task of filteredTasks) {
      const bucket = getTaskTimeBucket(task.createdAt);
      buckets[bucket].push(task);
    }

    return buckets;
  }, [filteredTasks]);

  const statusStyle: Record<string, string> = {
    CREATED: 'text-text-muted bg-border/40 border-border',
    QUEUED: 'text-amber-300 bg-amber-950/40 border-amber-800/50',
    PLANNING: 'text-primary bg-primary/10 border-primary/30 animate-pulse',
    EXECUTING: 'text-primary bg-primary/10 border-primary/30 animate-pulse glow-ai-cyan',
    WAITING_APPROVAL: 'text-primary-purple bg-primary-purple/10 border-primary-purple/30',
    COMPLETED: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    FAILED: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
    CANCELLED: 'text-text-muted bg-border/20 border-border',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background-deep/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/devis.png" alt="DeVis.ai" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-xl font-extrabold tracking-tight text-gradient-ai">
              DeVis.ai
            </span>
          </Link>
          <span className="text-text-muted text-sm">/ Tasks</span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/tasks" className="text-primary font-medium transition-colors">Tasks</Link>
          <Link href="/approvals" className="text-text-secondary hover:text-primary transition-colors">Approvals</Link>
          <Link href="/memory" className="text-text-secondary hover:text-primary transition-colors">Memory</Link>
          <Link href="/settings" className="text-text-secondary hover:text-primary transition-colors">Settings</Link>
          <div className="flex items-center gap-3 pl-2 border-l border-border/80">
            {user?.email && (
              <span className="text-xs text-text-secondary hidden md:inline truncate max-w-[160px]">
                {user.name || user.email}
              </span>
            )}
            <button 
              onClick={logout} 
              className="text-text-muted hover:text-rose-400 transition-colors text-xs cursor-pointer font-medium"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page title & action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground">Tasks & Automation</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Events
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Real-time timeline of all instructions executed by DeVis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTasks}
              title="Refresh tasks"
              className="px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-primary transition-colors text-sm cursor-pointer"
            >
              ↻ Refresh
            </button>
            <Link
              href="/dashboard"
              className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <span>+</span> New Task
            </Link>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 p-1 bg-surface-input border border-border rounded-xl w-full md:w-auto">
            {(
              [
                { id: 'all', label: `All (${tasks.length})` },
                {
                  id: 'active',
                  label: `Active (${tasks.filter((t) => ['CREATED', 'QUEUED', 'PLANNING', 'EXECUTING'].includes(t.status)).length})`,
                },
                {
                  id: 'completed',
                  label: `Completed (${tasks.filter((t) => t.status === 'COMPLETED').length})`,
                },
                {
                  id: 'failed',
                  label: `Failed (${tasks.filter((t) => t.status === 'FAILED').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-primary text-background shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input-brand w-full px-3.5 py-2 text-xs rounded-xl pl-9"
            />
            <span className="absolute left-3 top-2.5 text-text-muted text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="card-brand rounded-2xl p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 glow-ai-cyan" />
            <p className="text-xs text-text-muted">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card-brand rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-surface-input border border-border flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              📋
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {search || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-6">
              {search || filter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Speak to DeVis using the microphone on your dashboard or type a prompt.'}
            </p>
            <Link href="/dashboard" className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-block">
              Go to Dashboard & Speak
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {(['today', 'yesterday', 'this_week', 'this_month', 'older'] as TimeBucketKey[]).map((bucketKey) => {
              const bucketItems = groupedTasks[bucketKey];
              if (bucketItems.length === 0) return null;

              const cfg = BUCKET_CONFIG[bucketKey];

              return (
                <section key={bucketKey} className="space-y-3">
                  {/* Time Section Divider */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-text-muted font-medium">
                      {bucketItems.length} {bucketItems.length === 1 ? 'task' : 'tasks'}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>

                  {/* Task cards list */}
                  <div className="grid gap-3">
                    {bucketItems.map((task) => {
                      const targetUrl = extractTargetUrl(task);
                      const isExecuting = ['CREATED', 'QUEUED', 'PLANNING', 'EXECUTING'].includes(task.status);

                      return (
                        <div
                          key={task.id}
                          className="card-brand p-4 sm:p-5 rounded-xl transition-all duration-200 hover:border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Input type icon */}
                            <span
                              className="w-9 h-9 rounded-lg bg-surface-input border border-border flex items-center justify-center text-sm shrink-0 mt-0.5"
                              title={task.inputType === 'VOICE' ? 'Voice Command' : 'Text Command'}
                            >
                              {task.inputType === 'VOICE' ? '🎙️' : '💬'}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-foreground truncate max-w-lg">
                                  {task.inputText}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle[task.status] || 'text-text-muted bg-border/20 border-border'}`}>
                                  {task.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-muted flex-wrap">
                                <span>
                                  Created: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {task.completedAt && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-400/90 font-medium">
                                      Done in {Math.max(1, Math.round((new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / 1000))}s
                                    </span>
                                  </>
                                )}
                                {task.steps && task.steps.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                                      {task.steps[0].toolName === 'playwright_browser' ? '🎭 Playwright' : task.steps[0].toolName}
                                    </span>
                                    {task.steps[0].outputJson?.site && (
                                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px]">
                                        {String(task.steps[0].outputJson.site)}
                                      </span>
                                    )}
                                    {task.steps[0].outputJson?.searchQuery && (
                                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground font-mono text-[10px]">
                                        &ldquo;{String(task.steps[0].outputJson.searchQuery)}&rdquo;
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Quick open URL link if applicable */}
                            {targetUrl && (
                              <a
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1"
                                title={`Open ${targetUrl}`}
                              >
                                <span>Launch</span>
                                <span className="text-[10px]">↗</span>
                              </a>
                            )}

                            {/* Cancel button if running */}
                            {isExecuting && (
                              <button
                                onClick={(e) => handleCancel(task.id, e)}
                                title="Cancel Task"
                                className="px-2.5 py-1.5 rounded-lg bg-surface-input hover:bg-surface border border-border text-amber-300 hover:text-amber-200 text-xs font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDelete(task.id, e)}
                              disabled={deletingId === task.id}
                              title="Delete Task"
                              className="p-1.5 rounded-lg bg-surface-input hover:bg-rose-950/40 border border-border hover:border-rose-800/60 text-text-muted hover:text-rose-400 transition-colors text-xs cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === task.id ? '…' : '🗑️'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
