'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getOrderedCustomOptions } from '@/lib/format-options';
import { wishlistKey, type WishlistItem } from '@/lib/wishlist';
import WishlistProductDetails from '@/components/WishlistProductDetails';

export default function WishlistPage() {
  const { items, loading, error, retry, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [busy, setBusy] = useState<{ key: string; action: 'move' | 'remove' } | null>(null);
  const [message, setMessage] = useState('');

  async function moveToCart(item: WishlistItem) {
    setBusy({ key: wishlistKey(item), action: 'move' });
    setMessage('');
    try {
      if (item.category === 'Non-Customizable') {
        const response = await fetch(`/api/products/${encodeURIComponent(item.id)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('This product is no longer available.');
        const product = await response.json();
        if (product.stock <= 0) throw new Error('This product is currently out of stock.');
        addItem({ ...item, name: product.name, price: product.sellingPrice ?? product.listingPrice,
          image: product.imageUrl, stock: product.stock, quantity: Math.min(item.quantity, product.stock) });
      } else {
        addItem({ ...item, id: `custom-${crypto.randomUUID()}` });
      }
      const removed = await removeItem(item);
      setMessage(removed
        ? `${item.name} moved to cart.`
        : `${item.name} was added to cart, but could not be removed from your wishlist. Use Remove from Wishlist to try again.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to add product to cart.');
    } finally { setBusy(null); }
  }

  async function removeFromWishlist(item: WishlistItem) {
    setBusy({ key: wishlistKey(item), action: 'remove' });
    setMessage('');
    try {
      const removed = await removeItem(item);
      setMessage(removed ? `${item.name} removed from your wishlist.` : 'Unable to remove this item. Please try again.');
    } finally { setBusy(null); }
  }

  return <div className="section-padding" style={{ background: 'var(--off-white)', minHeight: '75vh', paddingTop: 'max(120px, 15vh)' }}>
    <div className="container">
      <h1 style={{ color: 'var(--brand-primary)' }}>My Wishlist</h1>
      <p>Save your favorite products and custom designs for later.</p>
      {!user && <p>Sign in to <Link href="/account" style={{ color: 'var(--brand-primary)' }}>save your wishlist to your account</Link>.</p>}
      {error && <p role="alert" style={{ color: 'var(--error)' }}>{error}</p>}
      <p role="status" aria-live="polite">{message}</p>
      {loading ? (error ? <button type="button" className="btn btn-outline" onClick={retry}>Try Again</button> : <p>Loading your wishlist...</p>) : items.length === 0 ? <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brand-primary)' }}>Your wishlist is empty</h2>
        <p>Use the heart button on a product or custom design to save it here.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div> : <div className="grid-3">
        {items.map(item => <article className="card" key={wishlistKey(item)} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: 220, objectFit: 'contain' }} />}
          <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-primary)' }}>{item.name}</h2>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--brand-secondary)', fontWeight: 800 }}>{item.category === 'Linked' ? 'From ' : ''}${item.price.toFixed(2)}</span>
            {item.category === 'Custom' ? ' (estimated unit price)' : ''} · Qty: {item.quantity}
          </div>
          {item.category !== 'Custom' && <WishlistProductDetails productId={item.id} linked={item.category === 'Linked'} />}
          {item.customOptions && <dl style={{ fontSize: '.875rem', overflowWrap: 'anywhere' }}>
            {getOrderedCustomOptions(item.customOptions).map(([key, value]) => <div key={key} style={{ marginBottom: '.35rem' }}><dt style={{ fontWeight: 600, display: 'inline' }}>{key}: </dt><dd style={{ display: 'inline', margin: 0 }}>{value}</dd></div>)}
          </dl>}
          <div style={{ marginTop: 'auto', display: 'grid', gap: '.75rem' }}>
            {item.category === 'Custom' && <Link href={`/customize?wishlist=${encodeURIComponent(item.id)}`} className="btn btn-outline">Edit Design</Link>}
            {item.category !== 'Custom' && <Link href={item.href ?? `/products/${encodeURIComponent(item.id)}`} className="btn btn-outline">View Product</Link>}
            {item.category !== 'Linked' && <button type="button" className="btn btn-primary" disabled={busy !== null || loading} onClick={() => void moveToCart(item)}>{busy?.key === wishlistKey(item) && busy.action === 'move' ? 'Moving...' : 'Move to Cart'}</button>}
            <button type="button" className="btn btn-outline" disabled={busy !== null || loading} onClick={() => void removeFromWishlist(item)}>
              {busy?.key === wishlistKey(item) && busy.action === 'remove' ? 'Removing...' : 'Remove from Wishlist'}
            </button>
          </div>
        </article>)}
      </div>}
      <Link href="/cart" className="btn btn-outline" style={{ marginTop: '2rem' }}>View Cart</Link>
    </div>
  </div>;
}
