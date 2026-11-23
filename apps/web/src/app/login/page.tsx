'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:3001/api';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  const urlError = searchParams.get('error');

  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(
    urlError === 'oauth_failed' ? 'Social login failed. Please try again.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      router.replace(from);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Header with Logo */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="w-14 h-14 p-1 rounded-xl bg-surface border border-border shadow-md mb-3 glow-ai-cyan group-hover:border-primary/40 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/devis.png" alt="DeVis.AI" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-gradient-ai">
            DeVis.ai
          </span>
        </Link>
        <p className="text-text-secondary mt-2 text-sm">Sign in to your AI agent</p>
      </div>

      {/* Card */}
      <div className="card-brand rounded-2xl p-8 shadow-xl">
        {/* Tab switcher */}
        <div className="flex bg-background-deep border border-border rounded-lg p-1 mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError('');
              }}
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all capitalize ${
                tab === t 
                  ? 'btn-primary' 
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3 mb-6">
          <a
            href={`${API_URL}/v1/auth/google`}
            className="btn-secondary flex items-center justify-center gap-3 w-full py-3 rounded-lg text-sm font-medium"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </a>

          <a
            href={`${API_URL}/v1/auth/github`}
            className="btn-secondary flex items-center justify-center gap-3 w-full py-3 rounded-lg text-sm font-medium"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Rohan Patel"
                className="input-brand w-full px-4 py-3 rounded-lg text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input-brand w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              {tab === 'login' && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-brand w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm bg-red-950/40 border border-red-800/80 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="text-center text-text-muted text-xs mt-6">
        By signing in, you agree to let Devis help you get things done.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle brand glow accent */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[520px] h-[300px] bg-gradient-to-r from-primary/10 via-primary-blue/10 to-primary-purple/10 blur-[100px] rounded-full"
      />
      <Suspense fallback={<div className="text-text-muted text-sm">Loading…</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
