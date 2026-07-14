'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { downloadInvoice } from '@/lib/invoice';
import { getOrderedCustomOptions } from '@/lib/format-options';

const STATUS_LABELS: Record<string, string> = {
  ORDER_RECEIVED: 'Order Received (Pending)',
  STITCHING: 'Stitching In Progress',
  PROCESSING: 'Processing / Picking',
  PACKING: 'Packing',
  SHIPPING: 'Shipping (In Transit)',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
};

const statusColor: Record<string, { bg: string; color: string }> = {
  ORDER_RECEIVED: { bg: '#fff7ed', color: '#f59e0b' },
  STITCHING: { bg: '#fdf4ff', color: '#a855f7' },
  PROCESSING: { bg: '#eff6ff', color: '#3b82f6' },
  PACKING: { bg: '#fff1f2', color: '#f43f5e' },
  SHIPPING: { bg: '#f5f3ff', color: '#8b5cf6' },
  OUT_FOR_DELIVERY: { bg: '#fefce8', color: '#ca8a04' },
  DELIVERED: { bg: '#f0fdf4', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
  PENDING: { bg: '#fff7ed', color: '#f59e0b' },
  SHIPPED: { bg: '#f5f3ff', color: '#8b5cf6' },
};

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();
  const { logoUrl, siteName } = useSite();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/account');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); setOrdersLoading(false); })
      .catch(() => setOrdersLoading(false));
  }, [user]);

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'max(120px, 15vh)', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', margin: 0 }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
          <Link href="/account/dashboard" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
        </div>

        {ordersLoading ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>No orders yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Once you place an order, it will appear here.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-primary">Shop Products</Link>
              <Link href="/customize" className="btn btn-outline">Custom Cushion</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(order => {
              const sc = statusColor[order.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                  {/* Order header row — always visible, clickable */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', gap: '1rem', cursor: 'pointer', background: isOpen ? 'var(--gray-50)' : 'white', transition: 'background 0.15s' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: '1.15rem' }}>
                        ${order.total.toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--gray-100)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                      {/* Items with images */}
                      <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Items Ordered</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {(order.items as any[])?.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-100)' }}>
                              <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                {item.image
                                  ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : (item.category === 'Non-Customizable' ? '🛍️' : '🛋️')}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  {item.category ?? 'Custom'} · Quantity: {item.quantity} · ${item.price?.toFixed(2)} each
                                </div>
                                {item.customOptions && Object.keys(item.customOptions).length > 0 && (
                                  <div style={{ fontSize: '0.8rem', color: '#666', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Details: </span>
                                    {getOrderedCustomOptions(item.customOptions)
                                      .map(([k, v], i, arr) => (
                                        <span key={k}>
                                          {k.charAt(0).toUpperCase() + k.slice(1)}: {v as string}{i < arr.length - 1 ? ' | ' : ''}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--gray-100)' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Price Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(order.items as any[])?.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <span>{item.name} × {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', paddingTop: '0.5rem', borderTop: '1px solid var(--gray-200)', marginTop: '0.25rem' }}>
                            <span>Delivery Charge</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${(order.deliveryCharge || 0).toFixed(2)}</span>
                          </div>
                          {(() => {
                            const subtotal = (order.items as any[])?.reduce((acc: number, val: any) => acc + (val.price * val.quantity), 0) || 0;
                            const calculatedTotal = subtotal + (order.deliveryCharge || 0);
                            const discount = calculatedTotal - order.total;
                            if (discount > 0.01) {
                              let label = 'Discount Applied';
                              if (order.notes && order.notes.includes('Promo Code Applied')) {
                                const match = order.notes.match(/\(([^)]+)\)/);
                                if (match && match[1] && !match[1].startsWith('Stripe Discount')) {
                                  label = `Discount (${match[1]})`;
                                }
                              }
                              return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>
                                  <span>{label}</span>
                                  <span>-${discount.toFixed(2)}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: '2px solid var(--gray-300)', marginTop: '0.25rem' }}>
                            <span>Total</span><span style={{ color: 'var(--brand-secondary)' }}>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping & Billing addresses */}
                      {order.shippingAddr && (order.shippingAddr.shipping || order.shippingAddr.fullName) && (() => {
                        const ship = order.shippingAddr.shipping ?? order.shippingAddr;
                        const bill = order.shippingAddr.billing;
                        // Compare all fields — any difference means billing is different
                        const billDiff = bill && JSON.stringify(bill) !== JSON.stringify(ship);
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div style={{ flex: '1 1 250px' }}>
                              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>🚚 Shipping Address</h3>
                              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{ship.fullName}</strong><br />
                                {ship.address}<br />
                                {ship.city}{ship.state ? `, ${ship.state}` : ''} {ship.zip}<br />
                                {ship.country}<br />
                                {ship.phone && <span>📞 {ship.phone}<br /></span>}
                                {ship.email && <span>✉️ {ship.email}</span>}
                              </div>
                            </div>
                            <div style={{ flex: '1 1 250px' }}>
                              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>💳 Billing Address</h3>
                              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                                {billDiff ? (
                                  <>
                                    <strong style={{ color: 'var(--text-primary)' }}>{bill.fullName}</strong><br />
                                    {bill.address}<br />
                                    {bill.city}{bill.state ? `, ${bill.state}` : ''} {bill.zip}<br />
                                    {bill.country}
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Same as shipping address</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#15803d' }}>Tracking Number</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#166534', marginTop: '0.25rem' }}>{order.trackingNumber}</div>
                          </div>
                        </div>
                      )}

                      {/* Invoice */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--gray-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Payment Method: <span style={{ color: 'var(--brand-primary)', textTransform: 'uppercase' }}>{order.paymentMethod || 'COD'}</span></div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download your official tax invoice.</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); downloadInvoice(order, logoUrl, siteName); }} className="btn btn-outline btn-sm">
                          📄 Download Invoice
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
