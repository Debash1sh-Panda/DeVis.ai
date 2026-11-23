'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import {
  getAccessToken,
  setAuthTokens,
  clearAuthTokens,
  decodeJwt,
  isTokenExpired,
} from '@/lib/auth-storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full user profile from backend
  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token || isTokenExpired(token)) {
        clearAuthTokens();
        setUser(null);
        return;
      }
      const userData = await usersApi.getMe();
      setUser(userData);
    } catch {
      // Backend rejected or token expired
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  // Initialize auth state on application startup
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token && !isTokenExpired(token)) {
        const decoded = decodeJwt(token);
        if (decoded) {
          // Optimistically set decoded payload to prevent UI flash
          setUser({
            id: decoded.sub,
            email: decoded.email,
          });
        }
        // Verify with backend
        await refreshUser();
      } else {
        clearAuthTokens();
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    setAuthTokens(tokens.accessToken, tokens.refreshToken);
    const decoded = decodeJwt(tokens.accessToken);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
      });
    }
    // Fetch user details
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const tokens = await authApi.register(name, email, password);
    setAuthTokens(tokens.accessToken, tokens.refreshToken);
    const decoded = decodeJwt(tokens.accessToken);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name,
      });
    }
    await refreshUser();
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
