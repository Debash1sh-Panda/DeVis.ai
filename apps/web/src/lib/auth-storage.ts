/**
 * DeVis.ai — Centralized Authentication Storage & Cookie Management
 *
 * Ensures tokens are synchronized in both document.cookie (for Next.js Middleware)
 * and localStorage (for API clients and offline fallback).
 */

export interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  iat?: number;
}

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Decode JWT payload without external dependencies
 */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  // Add a 5 second leeway
  return Date.now() >= (decoded.exp * 1000 - 5000);
}

/**
 * Save authentication tokens to both document.cookie and localStorage
 */
export function setAuthTokens(accessToken: string, refreshToken?: string | null) {
  if (typeof window === 'undefined') return;

  const decoded = decodeJwt(accessToken);
  // Default to 15 minutes or token exp
  const maxAgeSeconds = decoded?.exp
    ? Math.max(0, Math.floor(decoded.exp - Date.now() / 1000))
    : 15 * 60;

  // Set access token cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(
    accessToken
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${
    window.location.protocol === 'https:' ? '; Secure' : ''
  }`;

  // Store in localStorage
  localStorage.setItem('access_token', accessToken);

  if (refreshToken) {
    // 7 days expiration for refresh token
    const refreshMaxAge = 7 * 24 * 60 * 60;
    document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(
      refreshToken
    )}; path=/; max-age=${refreshMaxAge}; SameSite=Lax${
      window.location.protocol === 'https:' ? '; Secure' : ''
    }`;
    localStorage.setItem('refresh_token', refreshToken);
  }
}

/**
 * Retrieve access token from cookies or localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Try reading from cookie
  const cookieMatch = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

  if (cookieMatch) {
    const token = decodeURIComponent(cookieMatch.split('=')[1]);
    if (token) return token;
  }

  // 2. Fallback to localStorage
  const localToken = localStorage.getItem('access_token');
  if (localToken) {
    // Re-sync to cookie if missing
    if (!isTokenExpired(localToken)) {
      setAuthTokens(localToken);
    }
    return localToken;
  }

  return null;
}

/**
 * Retrieve refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  const cookieMatch = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${REFRESH_TOKEN_COOKIE}=`));

  if (cookieMatch) {
    return decodeURIComponent(cookieMatch.split('=')[1]);
  }

  return localStorage.getItem('refresh_token');
}

/**
 * Completely clear all tokens and cookies on logout
 */
export function clearAuthTokens() {
  if (typeof window === 'undefined') return;

  // Clear cookies by setting expired date and max-age 0
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
