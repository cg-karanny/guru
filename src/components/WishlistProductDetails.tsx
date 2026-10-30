'use client';

import { useEffect, useState } from 'react';

interface ProductDetails {
  description: string;
  sku?: string;
  stock?: number;
}

export default function WishlistProductDetails({ productId, linked }: { productId: string; linked: boolean }) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${linked ? 'linked-products' : 'products'}/${encodeURIComponent(productId)}`, {
      cache: 'no-store', signal: controller.signal,
    }).then(async response => {
      if (response.status === 404) {
        setStatus('unavailable');
        return;
      }
      if (!response.ok) throw new Error('Unable to load product details.');
      const details: ProductDetails = await response.json();
      if (!controller.signal.aborted) {
        setProduct(details);
        setStatus('ready');
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });
    return () => controller.abort();
  }, [productId, linked]);

  if (status === 'loading') return <p style={{ fontSize: '.875rem' }}>Loading product details...</p>;
  if (status === 'unavailable') return <p style={{ fontSize: '.875rem', color: 'var(--error)' }}>This product is no longer available.</p>;
  if (status === 'error' || !product) return <p style={{ fontSize: '.875rem' }}>Product details could not be loaded. Please refresh to try again.</p>;

  return <div style={{ fontSize: '.875rem', color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>
    {product.description && <p style={{ whiteSpace: 'pre-line', marginBottom: '.75rem' }}>{product.description}</p>}
    <dl style={{ display: 'grid', gap: '.35rem' }}>
      {!linked && <div><dt style={{ display: 'inline', fontWeight: 600 }}>Product type: </dt><dd style={{ display: 'inline', margin: 0 }}>Ready-made Product</dd></div>}
      {product.sku && <div><dt style={{ display: 'inline', fontWeight: 600 }}>SKU: </dt><dd style={{ display: 'inline', margin: 0 }}>{product.sku}</dd></div>}
      {!linked && typeof product.stock === 'number' && <div>
        <dt style={{ display: 'inline', fontWeight: 600 }}>Availability: </dt>
        <dd style={{ display: 'inline', margin: 0, color: product.stock > 0 ? 'var(--text-secondary)' : 'var(--error)' }}>
          {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
        </dd>
      </div>}
    </dl>
  </div>;
}
