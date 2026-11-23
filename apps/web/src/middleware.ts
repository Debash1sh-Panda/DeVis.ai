import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that do NOT require authentication.
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

/**
 * Routes that authenticated users should NOT see (redirect to /dashboard).
 */
const AUTH_ONLY_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Helper to inspect and validate token expiration in the Edge/Node runtime
 */
function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);

    if (!payload || typeof payload.exp !== 'number') return false;

    // Check expiration (with a 5 second leeway)
    return payload.exp * 1000 > Date.now() + 5000;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get('access_token');
  const token = tokenCookie?.value;
  const isAuthenticated = isValidToken(token);

  // 1. Is this a route intended only for unauthenticated users?
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthOnlyRoute) {
    if (isAuthenticated) {
      // Already authenticated -> redirect to /dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow unauthenticated user to access login/register
    return NextResponse.next();
  }

  // 2. Is this a public route (such as home landing page or OAuth callback)?
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. All other routes are PROTECTED
  if (!isAuthenticated) {
    // Redirect to /login and preserve the intended destination
    const loginUrl = new URL('/login', request.url);
    const returnUrl = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('from', returnUrl);

    const response = NextResponse.redirect(loginUrl);

    // If an expired token was present, clear it from cookies
    if (tokenCookie) {
      response.cookies.delete('access_token');
    }

    return response;
  }

  // 4. Authenticated user accessing a protected route -> proceed
  return NextResponse.next();
}

/**
 * Match all request paths except:
 * - api routes (/api/*)
 * - _next static files and images
 * - Static assets (favicon, images, etc.)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.png|devis\\.png|devis_og\\.png|opengraph-image\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
