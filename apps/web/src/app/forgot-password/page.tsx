'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[520px] h-[300px] bg-gradient-to-r from-primary/10 via-primary-blue/10 to-primary-purple/10 blur-[100px] rounded-full"
      />

      <div className="w-full max-w-md relative z-10">
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
          <p className="text-text-secondary mt-2 text-sm">Reset your password</p>
        </div>

        <div className="card-brand rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xl mx-auto mb-3">
                ✉️
              </div>
              <h3 className="font-semibold text-foreground mb-2">Check your email</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                If an account exists for <span className="text-foreground font-medium">{email}</span>, we have sent instructions to reset your password.
              </p>
              <Link href="/login" className="btn-secondary px-6 py-2.5 rounded-lg text-sm inline-block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-brand w-full px-4 py-3 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 rounded-lg font-semibold cursor-pointer"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-text-secondary hover:text-primary transition-colors">
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
