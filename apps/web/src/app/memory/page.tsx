'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

export default function MemoryPage() {
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
          <span className="text-text-muted text-sm">/ Memory</span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/tasks" className="text-text-secondary hover:text-primary transition-colors">Tasks</Link>
          <Link href="/approvals" className="text-text-secondary hover:text-primary transition-colors">Approvals</Link>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Agent Memory</h1>
          <p className="text-sm text-text-secondary mt-1">
            Context and persistent preferences stored by Devis across conversations
          </p>
        </div>

        {/* Search input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search stored memories…"
            className="input-brand w-full px-4 py-3 rounded-lg text-sm max-w-md"
          />
        </div>

        <div className="card-brand rounded-xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary text-xl mx-auto mb-3">
            🧠
          </div>
          <h3 className="font-semibold text-foreground mb-1">No memories stored yet</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto mb-5">
            As you interact with Devis, relevant preferences and facts will automatically be organized here.
          </p>
          <Link href="/dashboard" className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium inline-block">
            Start a Conversation
          </Link>
        </div>
      </main>
    </div>
  );
}
