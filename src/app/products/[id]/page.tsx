'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

type BlockType = 'paragraph' | 'heading' | 'bullet' | 'gap';
interface ContentBlock { id: string; type: BlockType; text: string; }
interface FaqItem { id: string; q: string; a: string; }

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fee2e2', color: '#dc2626', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} /> Out of Stock
    </span>
  );
  if (stock <= 5) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#d97706', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} /> Almost Gone — {stock} left
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#16a34a', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> In Stock
    </span>
  );
}

/** Parse **bold**, _italic_, __underline__ markers in a string into React nodes */
function parseInline(text: string): React.ReactNode {
  // Combined: **bold**, _italic_, __underline__
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|_(.+?)_)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith('**')) {
      parts.push(<strong key={key++} style={{ fontWeight: 800, color: 'inherit' }}>{match[2]}</strong>);
    } else if (match[0].startsWith('__')) {
      parts.push(<u key={key++} style={{ textDecorationColor: 'currentColor' }}>{match[3]}</u>);
    } else {
      parts.push(<em key={key++} style={{ fontStyle: 'italic' }}>{match[4]}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

function RichContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {blocks.map(block => {
        switch (block.type) {
          case 'heading':
            return (
              <h3 key={block.id} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', margin: '1.2rem 0 0.4rem', lineHeight: 1.3 }}>
                {parseInline(block.text)}
              </h3>
            );
          case 'paragraph':
            return (
              <p key={block.id} style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0.25rem 0' }}>
                {parseInline(block.text)}
              </p>
            );
          case 'bullet':
            return (
              <div key={block.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', margin: '0.15rem 0', paddingLeft: '0.5rem' }}>
                <span style={{ color: 'var(--brand-secondary)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.5, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{parseInline(block.text)}</span>
              </div>
            );
          case 'gap':
            return <div key={block.id} style={{ height: '1.5rem' }} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {faqs.map((faq, idx) => (
        <div key={faq.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '10px', overflow: 'hidden', boxShadow: openIdx === idx ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}>
          <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            style={{ width: '100%', padding: '1rem 1.25rem', background: openIdx === idx ? 'var(--brand-primary)' : 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', textAlign: 'left', transition: 'background 0.2s' }}>
            <span style={{ fontWeight: 700, fontSize: '0.97rem', color: openIdx === idx ? 'white' : 'var(--text-primary)', lineHeight: 1.4 }}>
              {faq.q}
            </span>
            <span style={{ fontSize: '1rem', color: openIdx === idx ? 'white' : 'var(--text-muted)', flexShrink: 0, display: 'inline-block', transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
              ▼
            </span>
          </button>
          {openIdx === idx && (
            <div style={{ padding: '1rem 1.25rem 1.25rem', background: '#fafafa', borderTop: '1px solid var(--gray-100)', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {parseInline(faq.a)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);          // ← Next.js 16: unwrap with React.use()
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const richBlocks: ContentBlock[] = (() => {
    try { return product?.richDescription ? JSON.parse(product.richDescription) : []; } catch { return []; }
  })();

  const faqs: FaqItem[] = (() => {
    try { return product?.faqData ? JSON.parse(product.faqData) : []; } catch { return []; }
  })();

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem({ id: product.id, name: product.name, price: product.sellingPrice || product.listingPrice, quantity: qty, image: product.imageUrl, category: 'Non-Customizable', stock: product.stock });
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    addItem({ id: product.id, name: product.name, price: product.sellingPrice || product.listingPrice, quantity: qty, image: product.imageUrl, category: 'Non-Customizable', stock: product.stock });
    router.push('/cart');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'max(120px, 15vh)', background: 'var(--off-white)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>
          {/* ⏳ */}
          <svg xmlns="http://www.w3.org/2000/svg" height={50} width={50} viewBox="0 0 512 512"><g strokeWidth="0"><path d="M82.4 19.1c-1.7 1.9-1.9 3.8-1.9 18.3v16.1l3.1 5.5c3.6 6.4 10.2 11.1 16.7 11.9l4.2.6.8 8.4c5 55.7 38.5 108.5 91.7 144.6 15.3 10.3 20.1 18 19.9 31.9-.1 13-5.1 21.1-19 30.5-27.4 18.6-50.3 41.9-66.1 67.3-14.4 23.3-24.2 51.8-26.5 77.9l-.8 8.3-4.5.8c-5.5.9-11.5 5-15.3 10.4-3.6 5.1-5 14.2-4.5 28.6.3 9.6.6 11 2.6 13l2.3 2.3h341.8l2.3-2.3c2.2-2.2 2.3-2.9 2.3-18.5v-16.2l-3.1-5.5c-3.6-6.4-10.2-11.1-16.7-11.9l-4.1-.6-1.3-11.4c-6.2-55.8-39.4-106.9-92.7-142.6C300 277.4 295 269.2 295 256c0-13.3 4.9-21.3 19.1-30.9 27.3-18.6 50.5-42.1 65.9-66.9 14.5-23.5 23.3-48.8 26.3-75.3l1.3-11.4 4.1-.6c6.5-.8 13.1-5.5 16.7-11.9l3.1-5.5V37.4c0-14.5-.2-16.4-1.9-18.3l-1.9-2.1H84.3zM416 41.8c0 9.3-.1 10-2.6 12.3l-2.6 2.4H101.2l-2.6-2.4c-2.5-2.3-2.6-3-2.6-12.3V32h320zm-24.4 37.9c-4.6 51-35.6 98.8-86.4 133.4-11.4 7.7-16.4 13.1-21.1 22.9-3.5 7.4-3.6 7.7-3.6 20s.1 12.6 3.6 20c4.7 9.8 9.7 15.2 21.1 22.9 51.1 34.8 82.2 82.9 86.4 133.9l.7 8.2h-19.2l-3.2-5.8c-4.2-7.4-17.5-20.7-26.4-26.4-13.7-8.9-26.5-14.8-49-22.5-7.1-2.4-15.3-5.8-18.1-7.4-5.3-3-13.4-10.9-13.4-13 0-.7-.7-2.1-1.7-3.1-3.2-3.5-12.3-1.4-12.3 2.9 0 2.3-7.9 10.1-13.4 13.2-2.8 1.6-11.8 5.2-20.1 8.1-17.2 5.9-36.5 14.8-46.9 21.7-10.2 6.8-21.1 17.6-25.8 25.5l-4 6.8H120v-4.1c0-11 5.1-33 11.1-48.3 13.2-33.5 38.4-63.7 72.9-87.6 13.1-9 15.3-11.1 20.2-18.4 11.8-18.2 10.2-42.6-4-58.7-2.3-2.5-7.6-7-11.9-9.9-16.3-11.2-24.2-17.7-36.8-30.4-18.7-18.9-31.7-38.3-40.4-60.2-5.9-14.9-11.1-37.3-11.1-47.8V72h272.3zM261.4 386.9c6.5 5 14.9 9.1 25.6 12.6 29.5 9.6 50.3 20.7 62.3 33.3 3.1 3.3 5.7 6.5 5.7 7.1 0 .8-29.1 1.1-99 1.1s-99-.3-99-1.1c0-.6 2.6-3.8 5.8-7.1 11.9-12.6 32.7-23.7 62.2-33.3 10.6-3.5 20.1-8.2 26-12.9 2.5-2 4.7-3.6 4.9-3.6s2.7 1.8 5.5 3.9m152.3 71.3c2.1 2 2.3 3 2.3 12.5V481H96v-10c0-9.4.2-10.3 2.5-12.5l2.4-2.5h310.5z" /><path d="M154.6 123.2c-2.6 3.6-1.9 7.3 2.9 15.3 13.4 22.7 33.1 42.9 58.9 60.5 5.8 4 13.1 10 16.2 13.4 6.3 7 12.7 19 15 28.6 1.6 6.8 4.8 11 8.4 11s6.8-4.2 8.4-11c2.3-9.6 8.7-21.6 15-28.6 3.1-3.4 10.4-9.4 16.2-13.4 25.8-17.6 44.7-36.9 58.7-60.2 5-8.2 5.7-11.9 3.1-15.6l-1.5-2.2H156.1zm181.7 15.9c-3.3 5.6-17.2 21.7-24.6 28.3-7.9 7.1-16 13.3-27.9 21.5-9.1 6.2-19.1 16.5-23.9 24.4-1.9 3.1-3.6 5.6-3.9 5.6s-2-2.5-3.9-5.6c-4.8-7.9-14.9-18.2-23.9-24.4-19.3-13.2-32.1-24.4-42.9-37.3-4.3-5.2-8.6-10.8-9.6-12.5l-1.8-3.1h164.2zm-85.9 128c-1.5 1.6-1.9 3.6-1.9 8.9 0 8.3 1.8 11 7.5 11s7.5-2.7 7.5-11-1.8-11-7.5-11c-2.5 0-4.3.7-5.6 2.1m0 40c-1.5 1.6-1.9 3.6-1.9 8.9 0 8.3 1.8 11 7.5 11s7.5-2.7 7.5-11-1.8-11-7.5-11c-2.5 0-4.3.7-5.6 2.1" /></g></svg>
        </div>
        Loading product...
      </div>
    </div>
  );

  if (!product || product.error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 'max(120px, 15vh)', background: 'var(--off-white)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {/* 😕 */}
        <svg xmlns="http://www.w3.org/2000/svg" height={100} width={100} viewBox="0 0 512 512"><g strokeWidth="0"><path d="M235 16.7c-12.5 1.2-28.3 3.9-39.6 6.8-83.9 21.5-150.5 88-171.9 171.9-14.1 55.1-8.1 113.3 16.9 164.1 35.7 72.6 103.6 121.3 184.1 132 16 2.1 44.3 2.1 61 0 95.2-12.2 175-82.2 199.9-175.4 9.7-36.2 10.5-77.3 2.1-114.1C462.8 92.7 364.4 14.9 252.6 16.2c-7.8 0-15.7.3-17.6.5m45.7 32.8c92.5 11.9 164.6 82.9 178.9 176 2.3 14.9 2.2 44.1-.1 59-10.5 68.4-52.5 125.8-114 156-77.4 37.9-169.4 23.9-232.7-35.5-34.8-32.5-57.2-76.8-63.3-125-2.1-16.3-1.6-44.1 1-59 16.2-91.2 87.1-159.6 178-171.5 13.9-1.8 38.1-1.8 52.2 0" /><path d="M168.3 161c-4.6 2-7.9 6.4-8.9 11.8-1.4 7.3.5 9.6 37.6 46.7l35 35-35.4 35.5c-37.8 38-38.5 38.8-37.1 47.1 1.7 9.8 13.7 16 22.3 11.5 1.5-.8 18.2-17 37.2-36s34.9-34.6 35.5-34.6 16.5 15.6 35.5 34.6c19.1 19.2 35.9 35.2 37.7 36 9.5 4.1 20.4-1.3 22-11 1.4-9 1.9-8.4-36.3-46.6-19.5-19.6-35.4-36-35.4-36.5 0-.6 15.6-16.5 34.6-35.5s35.2-35.7 36-37.2c4.5-8.6-1.7-20.6-11.5-22.3-8.3-1.4-9.1-.7-47.1 37.1L254.5 232 220 197.4c-40.2-40.3-41.4-41.1-51.7-36.4" /></g></svg>
      </div>
      <h1 style={{ color: 'var(--brand-primary)' }}>Product Not Found</h1>
      <Link href="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Shop</Link>
    </div>
  );

  const price = product.sellingPrice || product.listingPrice;
  const hasDiscount = product.listingPrice > product.sellingPrice;
  const discountPct = hasDiscount ? Math.round(((product.listingPrice - product.sellingPrice) / product.listingPrice) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'max(100px, 12vh)', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link href="/products" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Shop</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-secondary)' }}>{product.name}</span>
        </div>

        {/* Hero Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start', marginBottom: '3rem' }}>
          {/* Image */}
          <div style={{ flex: '1 1 380px', maxWidth: '500px' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', aspectRatio: '1/1' }}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🛍️</div>}
            </div>
          </div>

          {/* Info panel */}
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--brand-primary)', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ marginBottom: '1rem' }}>
              <StockBadge stock={product.stock ?? 0} />
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-secondary)' }}>${price?.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${product.listingPrice?.toFixed(2)}</span>
                  <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800 }}>Save {discountPct}%</span>
                </>
              )}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#16a34a', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.2rem' }}>
              Free Delivery
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>
            {/* <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>SKU: {product.sku}</div> */}

            {/* Qty picker */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Qty</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-200)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}>−</button>
                  <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}>+</button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addedMsg && (
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.65rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                  ✓ Added to cart!
                </div>
              )}
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}>
                {product.stock === 0 ? 'Out of Stock' : ' Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn btn-outline"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}>
                {product.stock === 0 ? 'Unavailable' : 'Buy Now →'}
              </button>
              <Link href="/products" style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none', marginTop: '0.25rem' }}>
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Rich Description */}
        {richBlocks.length > 0 && (
          <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--gray-100)' }}>
              Product Details
            </h2>
            <RichContentRenderer blocks={richBlocks} />
          </div>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.4rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Click an arrow to reveal the answer.
            </p>
            <FaqAccordion faqs={faqs} />
          </div>
        )}
      </div>
    </div>
  );
}
