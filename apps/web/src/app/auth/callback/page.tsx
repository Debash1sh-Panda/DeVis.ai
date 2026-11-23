'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthTokens } from '@/lib/auth-storage';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      setAuthTokens(accessToken, refreshToken);
      router.replace('/dashboard');
    } else {
      router.replace('/login?error=oauth_failed');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 glow-ai-cyan" />
        <p className="text-text-secondary text-sm font-medium">Authenticating with DeVis.ai…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CallbackHandler />
    </Suspense>
  );
}
