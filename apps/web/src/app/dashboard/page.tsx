'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { DevisVoice } from '@/components/devis-voice';
import { useAuth } from '@/providers/auth-provider';
import { useTasksRealtime } from '@/hooks/use-tasks-realtime';
import { resolveWebIntent } from '@/lib/intent-resolver';

function getTaskTargetUrl(task: any): string | null {
  // 1. Check if backend step output already contains the exact search targetUrl
  if (task.steps && task.steps.length > 0) {
    for (const s of task.steps) {
      if (s.outputJson?.targetUrl) return s.outputJson.targetUrl;
      if (s.outputJson?.url) return s.outputJson.url;
    }
  }
  // 2. Resolve via intent resolver
  const intent = resolveWebIntent(task.inputText || '');
  return intent.targetUrl;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getAll();
      setTasks(data || []);
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Real-time WebSocket event connection (Socket.io)
  // Zero polling: instant event triggers on task create, start, complete, delete!
  useTasksRealtime(user?.id, setTasks);

  const submit = async (
    text: string,
    inputType: 'TEXT' | 'VOICE' = 'TEXT',
    explicitTargetUrl?: string | null
  ) => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const intent = resolveWebIntent(text.trim());
      const targetUrl = explicitTargetUrl || intent.targetUrl;

      // If user typed manually and clicked Send, open search/browser URL in new tab
      if (inputType === 'TEXT' && targetUrl) {
        try {
          window.open(targetUrl, '_blank');
        } catch {}
      }

      const task = await tasksApi.create({ input: text.trim(), inputType });
      // Prepend optimistically if socket hasn't fired yet
      setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [task, ...prev]));
      setInput('');
    } catch {
      alert('Failed to create task. Is the API running?');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceCommand = (command: string, targetUrl?: string | null) => {
    setInput(command);
    submit(command, 'VOICE', targetUrl);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeletingId(id);
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin glow-ai-cyan" />
      </div>
    );
  }

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
          <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/30 rounded-full px-2.5 py-0.5">
            beta
          </span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/tasks" className="text-text-secondary hover:text-primary transition-colors">Tasks</Link>
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Voice assistant card */}
        <div className="card-brand mb-10 flex flex-col items-center gap-6 p-8 rounded-2xl relative overflow-hidden shadow-lg">
          {/* Subtle AI ambient glow */}
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-primary/10 blur-[75px] rounded-full" 
          />

          <div className="text-center relative z-10">
            <h2 className="text-lg font-semibold text-foreground">Your AI Agent</h2>
            <p className="text-sm text-text-secondary mt-1">
              Click the mic or say <span className="text-primary font-medium">"Hey Devis"</span>, <span className="text-primary font-medium">"Hi"</span>, or <span className="text-primary font-medium">"Hey Baby"</span>
            </p>
          </div>

          <div className="relative z-10 w-full flex justify-center">
            <DevisVoice onCommand={handleVoiceCommand} />
          </div>

          {/* Text input fallback */}
          <div className="w-full px-2 flex gap-3 relative z-10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(input, 'TEXT')}
              placeholder='Or type: "Open YouTube and search React hooks"'
              className="input-brand flex-1 px-4 py-3 rounded-lg text-sm"
            />
            <button
              onClick={() => submit(input, 'TEXT')}
              disabled={submitting || !input.trim()}
              className="btn-primary px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {submitting ? '…' : 'Send'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: tasks.length },
            { label: 'Completed', value: tasks.filter((t) => t.status === 'COMPLETED').length },
            { label: 'Pending Approvals', value: tasks.filter((t) => t.status === 'WAITING_APPROVAL').length },
          ].map((s) => (
            <div key={s.label} className="card-brand p-5 rounded-xl text-center shadow-sm">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</p>
              <p className="text-[11px] text-text-secondary mt-1.5 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Task list */}
        <div className="card-brand rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">Recent Tasks</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              <Link href="/tasks" className="text-xs text-primary hover:underline ml-2">
                View all timeline →
              </Link>
            </div>
            {tasks.length > 0 && (
              <span className="text-xs text-text-muted">{tasks.length} {tasks.length === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          {tasks.length === 0 ? (
            <div className="px-5 py-12 text-center text-text-muted text-sm">
              No tasks yet — click the mic or speak to Devis!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.slice(0, 10).map((task) => {
                const targetUrl = getTaskTargetUrl(task);
                return (
                  <li key={task.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface-input/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{task.inputType === 'VOICE' ? '🎙️' : '💬'}</span>
                        <p className="text-sm text-foreground font-medium truncate">{task.inputText}</p>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[11px] font-semibold flex items-center gap-1 shadow-sm hover:shadow-[0_0_10px_rgba(56,224,248,0.2)]"
                        >
                          <span>Open Search</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}

                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[task.status] || 'text-text-muted bg-border/20 border-border'}`}>
                        {task.status}
                      </span>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        disabled={deletingId === task.id}
                        title="Delete task"
                        className="p-1 rounded hover:bg-rose-950/40 text-text-muted hover:text-rose-400 transition-colors text-xs cursor-pointer"
                      >
                        {deletingId === task.id ? '…' : '🗑️'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
