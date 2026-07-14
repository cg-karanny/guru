'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Stock badge for regular products ── */
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />Out of Stock
    </span>
  );
  if (stock <= 5) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />Almost Gone
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />In Stock
    </span>
  );
}

/* ── Check if a linked product has a detail page (rich content) ── */
function hasRichContent(lp: any): boolean {
  try {
    const blocks = lp.richDescription ? JSON.parse(lp.richDescription) : [];
    const faqs = lp.faqData ? JSON.parse(lp.faqData) : [];
    return blocks.length > 0 || faqs.length > 0;
  } catch { return false; }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/products', { cache: 'force-cache' }).then(r => r.json()).catch(() => []),
      fetch('/api/linked-products', { cache: 'force-cache' }).then(r => r.json()).catch(() => []),
    ]).then(([prod, linked]) => {
      setProducts(Array.isArray(prod) ? prod : []);
      setLinkedProducts(Array.isArray(linked) ? linked : []);
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product: any) => {
    if (product.stock === 0) { alert('This product is out of stock.'); return; }
    addItem({ id: product.id, name: product.name, price: product.sellingPrice || product.listingPrice, quantity: 1, image: product.imageUrl, category: 'Non-Customizable', stock: product.stock });
    alert('Added to cart!');
  };

  const handleBuyNow = (product: any) => {
    if (product.stock === 0) { alert('This product is out of stock.'); return; }
    addItem({ id: product.id, name: product.name, price: product.sellingPrice || product.listingPrice, quantity: 1, image: product.imageUrl, category: 'Non-Customizable', stock: product.stock });
    router.push('/cart');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLinked = linkedProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalResults = filteredProducts.length + filteredLinked.length;

  return (
    <main className="section-padding fade-in" style={{ background: 'var(--off-white)', minHeight: '100vh', paddingTop: 'max(120px, 15vh)' }}>
      <div className="container">

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-3xl)', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--brand-primary)', margin: 0 }}>Shop Products</h1>
            {!loading && (
              <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {totalResults} product{totalResults !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '400px' }}>
            <input type="text" placeholder="Search products..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="form-control" style={{ flex: 1 }} />
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/admin/products" className="btn btn-primary btn-lg whitespace-nowrap">
              Manage Products
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {/* ⏳ */}
              <svg xmlns="http://www.w3.org/2000/svg" height={50} width={50} viewBox="0 0 512 512"><g strokeWidth="0"><path d="M82.4 19.1c-1.7 1.9-1.9 3.8-1.9 18.3v16.1l3.1 5.5c3.6 6.4 10.2 11.1 16.7 11.9l4.2.6.8 8.4c5 55.7 38.5 108.5 91.7 144.6 15.3 10.3 20.1 18 19.9 31.9-.1 13-5.1 21.1-19 30.5-27.4 18.6-50.3 41.9-66.1 67.3-14.4 23.3-24.2 51.8-26.5 77.9l-.8 8.3-4.5.8c-5.5.9-11.5 5-15.3 10.4-3.6 5.1-5 14.2-4.5 28.6.3 9.6.6 11 2.6 13l2.3 2.3h341.8l2.3-2.3c2.2-2.2 2.3-2.9 2.3-18.5v-16.2l-3.1-5.5c-3.6-6.4-10.2-11.1-16.7-11.9l-4.1-.6-1.3-11.4c-6.2-55.8-39.4-106.9-92.7-142.6C300 277.4 295 269.2 295 256c0-13.3 4.9-21.3 19.1-30.9 27.3-18.6 50.5-42.1 65.9-66.9 14.5-23.5 23.3-48.8 26.3-75.3l1.3-11.4 4.1-.6c6.5-.8 13.1-5.5 16.7-11.9l3.1-5.5V37.4c0-14.5-.2-16.4-1.9-18.3l-1.9-2.1H84.3zM416 41.8c0 9.3-.1 10-2.6 12.3l-2.6 2.4H101.2l-2.6-2.4c-2.5-2.3-2.6-3-2.6-12.3V32h320zm-24.4 37.9c-4.6 51-35.6 98.8-86.4 133.4-11.4 7.7-16.4 13.1-21.1 22.9-3.5 7.4-3.6 7.7-3.6 20s.1 12.6 3.6 20c4.7 9.8 9.7 15.2 21.1 22.9 51.1 34.8 82.2 82.9 86.4 133.9l.7 8.2h-19.2l-3.2-5.8c-4.2-7.4-17.5-20.7-26.4-26.4-13.7-8.9-26.5-14.8-49-22.5-7.1-2.4-15.3-5.8-18.1-7.4-5.3-3-13.4-10.9-13.4-13 0-.7-.7-2.1-1.7-3.1-3.2-3.5-12.3-1.4-12.3 2.9 0 2.3-7.9 10.1-13.4 13.2-2.8 1.6-11.8 5.2-20.1 8.1-17.2 5.9-36.5 14.8-46.9 21.7-10.2 6.8-21.1 17.6-25.8 25.5l-4 6.8H120v-4.1c0-11 5.1-33 11.1-48.3 13.2-33.5 38.4-63.7 72.9-87.6 13.1-9 15.3-11.1 20.2-18.4 11.8-18.2 10.2-42.6-4-58.7-2.3-2.5-7.6-7-11.9-9.9-16.3-11.2-24.2-17.7-36.8-30.4-18.7-18.9-31.7-38.3-40.4-60.2-5.9-14.9-11.1-37.3-11.1-47.8V72h272.3zM261.4 386.9c6.5 5 14.9 9.1 25.6 12.6 29.5 9.6 50.3 20.7 62.3 33.3 3.1 3.3 5.7 6.5 5.7 7.1 0 .8-29.1 1.1-99 1.1s-99-.3-99-1.1c0-.6 2.6-3.8 5.8-7.1 11.9-12.6 32.7-23.7 62.2-33.3 10.6-3.5 20.1-8.2 26-12.9 2.5-2 4.7-3.6 4.9-3.6s2.7 1.8 5.5 3.9m152.3 71.3c2.1 2 2.3 3 2.3 12.5V481H96v-10c0-9.4.2-10.3 2.5-12.5l2.4-2.5h310.5z" /><path d="M154.6 123.2c-2.6 3.6-1.9 7.3 2.9 15.3 13.4 22.7 33.1 42.9 58.9 60.5 5.8 4 13.1 10 16.2 13.4 6.3 7 12.7 19 15 28.6 1.6 6.8 4.8 11 8.4 11s6.8-4.2 8.4-11c2.3-9.6 8.7-21.6 15-28.6 3.1-3.4 10.4-9.4 16.2-13.4 25.8-17.6 44.7-36.9 58.7-60.2 5-8.2 5.7-11.9 3.1-15.6l-1.5-2.2H156.1zm181.7 15.9c-3.3 5.6-17.2 21.7-24.6 28.3-7.9 7.1-16 13.3-27.9 21.5-9.1 6.2-19.1 16.5-23.9 24.4-1.9 3.1-3.6 5.6-3.9 5.6s-2-2.5-3.9-5.6c-4.8-7.9-14.9-18.2-23.9-24.4-19.3-13.2-32.1-24.4-42.9-37.3-4.3-5.2-8.6-10.8-9.6-12.5l-1.8-3.1h164.2zm-85.9 128c-1.5 1.6-1.9 3.6-1.9 8.9 0 8.3 1.8 11 7.5 11s7.5-2.7 7.5-11-1.8-11-7.5-11c-2.5 0-4.3.7-5.6 2.1m0 40c-1.5 1.6-1.9 3.6-1.9 8.9 0 8.3 1.8 11 7.5 11s7.5-2.7 7.5-11-1.8-11-7.5-11c-2.5 0-4.3.7-5.6 2.1" /></g></svg>
            </div>
            Loading products...
          </div>
        ) : (
          <>
            {/* ── Single unified grid: regular + linked together ── */}
            <div className="grid-4">

              {/* Regular (non-customisable) products */}
              {filteredProducts.map(product => (
                <div key={product.id} className="card"
                  style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.13)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

                  {/* Image — links to product detail page */}
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    {product.imageUrl ? (
                      <div style={{ width: '100%', height: '240px', overflow: 'hidden', background: 'var(--gray-50)' }}>
                        <img src={product.imageUrl} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }}
                          onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = 'scale(1.05)')}
                          onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = '')} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '240px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '4rem' }}>🛍️</span>
                      </div>
                    )}
                  </Link>

                  <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <StockBadge stock={product.stock ?? 0} />
                    </div>

                    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>
                        {product.name}
                      </h3>
                    </Link>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55 }}>
                      {product.description}
                    </p>

                    {/* spacer — pushes price + buttons to bottom */}
                    <div style={{ flex: 1 }} />

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-secondary)' }}>
                        ${(product.sellingPrice || product.listingPrice)?.toFixed(2)}
                      </span>
                      {product.listingPrice > product.sellingPrice && (
                        <>
                          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ${product.listingPrice?.toFixed(2)}
                          </span>
                          <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.73rem', fontWeight: 700 }}>
                            -{Math.round(((product.listingPrice - product.sellingPrice) / product.listingPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                      <Link href={`/products/${product.id}`} className="btn btn-outline"
                        style={{ width: '100%', textAlign: 'center', fontSize: '0.875rem', padding: '0.55rem' }}>
                        View Details
                      </Link>
                      <button onClick={() => handleAddToCart(product)} className="btn btn-primary"
                        style={{ width: '100%' }} disabled={product.stock === 0}>
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <button onClick={() => handleBuyNow(product)} className="btn btn-outline"
                        style={{ width: '100%' }} disabled={product.stock === 0}>
                        {product.stock === 0 ? 'Unavailable' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Linked products — appear in the same grid */}
              {filteredLinked.map(lp => {
                // View Details always goes to internal detail page
                const detailHref = `/products/linked/${lp.id}`;
                const shopHref = lp.link;
                const isExternal = shopHref?.startsWith('http');

                return (
                  <div key={lp.id} className="card"
                    style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.13)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

                    {/* Image — goes to internal detail page */}
                    <a href={detailHref}
                      style={{ textDecoration: 'none', display: 'block' }}>
                      {lp.imageUrl ? (
                        <div style={{ width: '100%', height: '240px', overflow: 'hidden', background: 'var(--gray-50)' }}>
                          <img src={lp.imageUrl} alt={lp.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }}
                            onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = 'scale(1.05)')}
                            onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = '')} />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '240px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '4rem' }}>🔗</span>
                        </div>
                      )}
                    </a>

                    <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                          🔗 Linked Product
                        </span>
                      </div> */}

                      <a href={detailHref} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lp.name}>
                          {lp.name}
                        </h3>
                      </a>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55 }}>
                        {lp.description}
                      </p>

                      {/* spacer pushes price + buttons to bottom */}
                      <div style={{ flex: 1 }} />

                      {/* Price */}
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-secondary)', marginBottom: '0.9rem' }}>
                        From ${lp.startingPrice?.toFixed(2)}
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* View Details → always internal page */}
                        <a href={detailHref} style={{ textDecoration: 'none' }}>
                          <div className="btn btn-outline" style={{ width: '100%', textAlign: 'center', fontSize: '0.875rem', padding: '0.55rem', display: 'block' }}>
                            View Details
                          </div>
                        </a>
                        {/* Customize / Shop Now → goes straight to the linked URL */}
                        <a href={shopHref} target={isExternal ? '_blank' : '_self'}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          style={{ textDecoration: 'none' }}>
                          <div className="btn btn-primary" style={{ width: '100%', textAlign: 'center', fontSize: '0.875rem', padding: '0.55rem', display: 'block' }}>
                            {isExternal ? 'Shop Now →' : ' Customize Now →'}
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Empty state */}
            {totalResults === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {/* 🔍 */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 512 512"><path d="M191 76.4C133.3 86.7 89.7 128.8 77.3 186.3c-2.5 11.6-2.5 42.8 0 54.5 4 17.9 10.4 33.4 20 48 20.8 31.6 50.9 52.1 88.5 60.4 14.5 3.2 40.7 3.2 55.1 0 22.6-5.1 40.9-13.5 57-26.2l5.3-4.2 58.2 58c31.9 31.9 59.1 58.5 60.3 59.1 9.3 4.7 18.9-4.9 14.2-14.2-.6-1.2-27.2-28.4-59.1-60.3l-58-58.1 5-6.4c18.9-24.3 29.4-57.7 27.9-89.4-1-21-5.4-38.1-14.5-56.1-19-37.8-53.5-64.4-95.7-73.9-9.7-2.2-40.5-2.9-50.5-1.1m48 22.5c23.6 5.4 42.6 16.4 59.7 34.6 18.3 19.4 28.4 41.6 31.3 68.9 3.7 34.4-10.5 72.1-36.3 96.3-24.5 22.8-58.9 34.7-90.6 31.4-27.7-3-49.9-12.9-69.4-31.1-23.6-22.1-35.9-48.8-37.4-81-2.7-58.7 40-110.9 98.5-120.5 11.5-1.9 32.8-1.2 44.2 1.4" /></svg>
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No products found</div>
                <div style={{ fontSize: '0.9rem' }}>Try a different search term.</div>
              </div>
            )}
          </>
        )}
      </div>
    </main >
  );
}
