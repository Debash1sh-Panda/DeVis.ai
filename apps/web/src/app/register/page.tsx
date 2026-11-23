'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.replace(from);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
        <p className="text-text-secondary mt-2 text-sm">Create your new account</p>
      </div>

      {/* Card */}
      <div className="card-brand rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[520px] h-[300px] bg-gradient-to-r from-primary/10 via-primary-blue/10 to-primary-purple/10 blur-[100px] rounded-full"
      />
      <Suspense fallback={<div className="text-text-muted text-sm">Loading…</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
