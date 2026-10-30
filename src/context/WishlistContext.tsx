'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { isWishlistItem, wishlistKey, type WishlistItem } from '@/lib/wishlist';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  error: string;
  retry: () => void;
  hasItem: (item: WishlistItem) => boolean;
  saveItem: (item: WishlistItem) => Promise<boolean>;
  removeItem: (item: WishlistItem) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_KEY = 'cg_wishlist_guest';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const scope = authLoading ? 'loading' : user?.id ?? 'guest';
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [state, setState] = useState<{ scope: string; items: WishlistItem[] }>({ scope: '', items: [] });
  const [error, setError] = useState('');
  const [readyScope, setReadyScope] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (scope === 'loading') return;
    let cancelled = false;
    setError('');
    setReadyScope('');
    const load = async () => {
      let guests: WishlistItem[] = [];
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(GUEST_KEY) ?? '[]');
        if (Array.isArray(stored)) guests = stored.filter(isWishlistItem);
      } catch { /* Browser storage may be unavailable. */ }
      try {
        let items = guests;
        if (scope !== 'guest') {
          const response = await fetch('/api/wishlist', { cache: 'no-store' });
          if (!response.ok) throw new Error('Unable to load wishlist. Please refresh to try again.');
          const remote: unknown = await response.json();
          if (cancelled || scopeRef.current !== scope) return;
          if (!Array.isArray(remote)) throw new Error('Unable to load wishlist.');
          const merged = new Map(remote.filter(isWishlistItem).map(item => [wishlistKey(item), item]));
          guests.forEach(item => merged.set(wishlistKey(item), item));
          items = [...merged.values()];
          if (guests.length) {
            for (let offset = 0; offset < guests.length; offset += 100) {
              if (cancelled || scopeRef.current !== scope) return;
              const saved = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(guests.slice(offset, offset + 100)) });
              if (!saved.ok) throw new Error('Unable to sync your guest wishlist. Please refresh to try again.');
            }
            if (cancelled || scopeRef.current !== scope) return;
            try { localStorage.removeItem(GUEST_KEY); } catch { /* Keep server data available. */ }
          }
        }
        if (!cancelled) {
          setState({ scope, items });
          setReadyScope(scope);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load wishlist.');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [scope, loadAttempt]);

  const items = state.scope === scope ? state.items : [];
  const loading = readyScope !== scope;
  const change = async (item: WishlistItem, remove: boolean): Promise<boolean> => {
    if (loading || !isWishlistItem(item)) return false;
    setError('');
    try {
      if (!remove && item.category === 'Custom') item = { ...item, id: `custom-${crypto.randomUUID()}` };
      if (scope !== 'guest') {
        const response = await fetch('/api/wishlist', {
          method: remove ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error('Could not update your wishlist. Please try again.');
      }
      if (scopeRef.current !== scope) return false;
      setState(previous => {
        const next = previous.items.filter(existing => wishlistKey(existing) !== wishlistKey(item));
        if (!remove) next.unshift(item);
        return { scope, items: next };
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update wishlist.');
      return false;
    }
  };

  useEffect(() => {
    if (state.scope === 'guest' && scope === 'guest' && readyScope === scope) {
      try { localStorage.setItem(GUEST_KEY, JSON.stringify(state.items)); }
      catch { setError('Browser storage is unavailable. Sign in to keep your wishlist.'); }
    }
  }, [state, scope, readyScope]);

  return <WishlistContext.Provider value={{ items, loading, error, retry: () => setLoadAttempt(attempt => attempt + 1),
    hasItem: item => items.some(existing => wishlistKey(existing) === wishlistKey(item)),
    saveItem: item => change(item, false), removeItem: item => change(item, true),
  }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
