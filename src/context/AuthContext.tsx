'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, otp?: string) => Promise<{ ok: boolean; error?: string; requireOtp?: boolean }>;
  refreshMedia: () => void;
  mediaRefreshKey: number;
  mediaCache: Record<string, string>;
  updateMediaCache: (key: string, url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialMediaCache = {} }: { children: React.ReactNode, initialMediaCache?: Record<string, string> }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaCache, setMediaCache] = useState<Record<string, string>>(initialMediaCache);
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);

  const refreshMedia = useCallback(() => {
    setMediaRefreshKey(prev => prev + 1);
  }, []);

  // Preload all media on app start for instant loading
  const preloadMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const items: { key: string; url: string }[] = await res.json();
      const cache: Record<string, string> = {};
      items.forEach(item => {
        cache[item.key] = item.url;
      });
      setMediaCache(cache);
    } catch (err) {
      console.error('Failed to preload media:', err);
    }
  }, []);

  // Preload media when component mounts
  useEffect(() => {
    preloadMedia();
  }, [preloadMedia]);

  // Refresh media cache when mediaRefreshKey changes
  useEffect(() => {
    if (mediaRefreshKey > 0) {
      preloadMedia();
    }
  }, [mediaRefreshKey, preloadMedia]);

  const updateMediaCache = useCallback((key: string, url: string) => {
    setMediaCache(prev => ({ ...prev, [key]: url }));
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      console.log('[AuthContext] Fetching /api/auth/me...');
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      console.log(`[AuthContext] /api/auth/me response: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[AuthContext] User loaded: ${data.user?.email}`);
        setUser(data.user);
      } else {
        console.log('[AuthContext] Not authenticated (401)');
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthContext] Fetch error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[AuthContext] Logging in...');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log(`[AuthContext] Login response: ${res.status}`, { email });
    if (res.ok) {
      setUser(data.user);
      console.log('[AuthContext] User set successfully');
      return { ok: true };
    }
    console.log('[AuthContext] Login failed:', data.error);
    return { ok: false, error: data.error ?? 'Login failed' };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, otp?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.requireOtp) {
        return { ok: true, requireOtp: true };
      }
      setUser(data.user);
      return { ok: true };
    }
    return { ok: false, error: data.error ?? 'Registration failed' };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshMedia, mediaRefreshKey, mediaCache, updateMediaCache }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
