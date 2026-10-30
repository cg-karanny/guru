'use client';

import { useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import type { WishlistItem } from '@/lib/wishlist';

export default function WishlistButton({ item, disabled = false }: { item: WishlistItem; disabled?: boolean }) {
  const { hasItem, saveItem, removeItem, loading, error } = useWishlist();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const saved = hasItem(item);
  return <div>
    <button type="button" className="btn btn-outline" disabled={disabled || loading || busy} aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Save'} ${item.name} ${saved ? 'from' : 'to'} wishlist`}
      style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}
      onClick={async () => {
        setBusy(true);
        const ok = await (saved ? removeItem(item) : saveItem(item));
        setFailed(!ok);
        setBusy(false);
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      {busy ? 'Saving...' : saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
    </button>
    {failed && <p role="alert" style={{ color: 'var(--error)', fontSize: '.85rem' }}>{error || 'Unable to save this item.'}</p>}
  </div>;
}
