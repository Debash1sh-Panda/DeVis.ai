'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsPage() {
  const { logout, user } = useAuth();

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
          <span className="text-text-muted text-sm">/ Settings</span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/tasks" className="text-text-secondary hover:text-primary transition-colors">Tasks</Link>
          <Link href="/approvals" className="text-text-secondary hover:text-primary transition-colors">Approvals</Link>
          <Link href="/memory" className="text-text-secondary hover:text-primary transition-colors">Memory</Link>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Manage AI model preferences and external integrations</p>
        </div>

        <div className="grid gap-6">
          {/* User Account Section */}
          <div className="card-brand rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground text-base mb-1">User Profile</h2>
            <p className="text-xs text-text-secondary mb-4">
              Your registered account details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-input border border-border rounded-lg p-3.5">
                <p className="text-xs text-text-muted">Account Name</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{user?.name || 'Not provided'}</p>
              </div>
              <div className="bg-surface-input border border-border rounded-lg p-3.5">
                <p className="text-xs text-text-muted">Email Address</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{user?.email || 'Loading…'}</p>
              </div>
            </div>
          </div>

          {/* AI Provider Section */}
          <div className="card-brand rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground text-base mb-1">AI Provider Engine</h2>
            <p className="text-xs text-text-secondary mb-4">
              Select which LLM model powers the multi-step planning loop
            </p>
            <div className="max-w-xs">
              <select className="input-brand w-full px-3.5 py-2.5 rounded-lg text-sm cursor-pointer">
                <option value="gemini">Google Gemini 1.5 Pro (Recommended)</option>
                <option value="openai">OpenAI GPT-4o</option>
              </select>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="card-brand rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground text-base mb-1">Connected Integrations</h2>
            <p className="text-xs text-text-secondary mb-4">
              OAuth services available for agent task execution
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Gmail', icon: '✉️', desc: 'Read & draft emails with approval' },
                { name: 'Google Calendar', icon: '📅', desc: 'Schedule meetings & events' },
                { name: 'Telegram Bot', icon: '✈️', desc: 'Real-time approval alerts' },
              ].map((item) => (
                <div 
                  key={item.name} 
                  className="bg-surface-input border border-border rounded-lg p-4 hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <span className="text-[11px] font-medium text-text-muted">Not connected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
