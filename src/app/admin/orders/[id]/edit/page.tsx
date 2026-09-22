'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getOrderedCustomOptions } from '@/lib/format-options';
import { downloadInvoice, downloadOrderDetails } from '@/lib/invoice';
import styles from '../../../admin.module.css';

const STATUS_OPTIONS = [
  'ORDER_RECEIVED',
  'STITCHING',
  'PROCESSING',
  'PACKING',
  'SHIPPING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const STATUS_LABELS: Record<string, string> = {
  ORDER_RECEIVED: 'Order Received (Pending)',
  STITCHING: 'Stitching In Progress',
  PROCESSING: 'Processing / Picking',
  PACKING: 'Packing',
  SHIPPING: 'Shipping (In Transit)',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
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

type OrderItem = {
  name: string;
  image?: string;
  category?: string;
  quantity: number;
  price: number;
  customOptions?: Record<string, string>;
};

type AddressBlock = {
  fullName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
};

type AdminOrder = {
  id: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  createdAt: string;
  status: string;
  total: number;
  paymentMethod?: string | null;
  deliveryCharge?: number | null;
  notes?: string | null;
  items: OrderItem[];
  shippingAddr?: (AddressBlock & {
    shipping?: AddressBlock;
    billing?: AddressBlock;
  }) | null;
};

function formatAddress(address?: AddressBlock | null) {
  if (!address) return <em style={{ color: 'var(--text-muted)' }}>Not provided</em>;

  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      <strong>{address.fullName || 'Unnamed customer'}</strong><br />
      {address.address && <>{address.address}<br /></>}
      {(address.city || address.state || address.zip) && (
        <>
          {address.city}{address.state ? `, ${address.state}` : ''} {address.zip}<br />
        </>
      )}
      {address.country && <>{address.country}<br /></>}
      {address.phone && <>Phone: {address.phone}<br /></>}
      {address.email && <>Email: {address.email}</>}
    </div>
  );
}

function formatOptionLabel(key: string) {
  const labels: Record<string, string> = {
    category: 'Category',
    type: 'Type',
    fill: 'Fill',
    zipper: 'Zipper',
    piping: 'Piping',
    ties: 'Ties',
    fabric: 'Fabric',
    dimensions: 'Dimensions',
  };

  return labels[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function getOrderItemOptions(options?: Record<string, string>) {
  const priority = ['type', 'category', 'fill', 'fabric', 'dimensions', 'zipper', 'piping', 'ties'];
  return getOrderedCustomOptions(options).sort(([a], [b]) => {
    const aIndex = priority.indexOf(a.toLowerCase());
    const bIndex = priority.indexOf(b.toLowerCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
}

export default function AdminOrderEditPage() {
  const { user, loading } = useAuth();
  const { logoUrl, siteName } = useSite();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [status, setStatus] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
      return;
    }

    if (user?.role === 'ADMIN' && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data.error || 'Failed to load order');
          setOrder(data);
          setStatus(data.status);
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to load order'))
        .finally(() => setDataLoading(false));
    }
  }, [user, loading, router, orderId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      setOrder(prev => prev ? { ...prev, status } : prev);
      setSuccess('Order status updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  const sc = order ? (statusColor[order.status] ?? { bg: '#f3f4f6', color: '#6b7280' }) : null;
  const ship = order?.shippingAddr?.shipping ?? order?.shippingAddr;
  const bill = order?.shippingAddr?.billing;
  const billDiff = bill && JSON.stringify(bill) !== JSON.stringify(ship);
  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const calculatedTotal = subtotal + (order?.deliveryCharge || 0);
  const discount = order ? calculatedTotal - order.total : 0;
  const isDelivered = order?.status === 'DELIVERED';

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div>
            <h1>Edit Order</h1>
            {order && (
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Order #{order.id.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
          <Link href="/admin/orders" className="btn btn-outline btn-sm">Back to Orders</Link>
        </div>

        {dataLoading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading order...
          </div>
        ) : error && !order ? (
          <div className="alert alert-error">{error}</div>
        ) : order ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Order Items</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) auto', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            item.category === 'Non-Customizable' ? 'Item' : 'Custom'
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {item.category ?? 'Custom'} - Qty: {item.quantity} - ${item.price?.toFixed(2)} each
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--brand-secondary)', whiteSpace: 'nowrap', fontSize: '1rem' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {item.customOptions && Object.keys(item.customOptions).length > 0 && (
                        <div style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: '8px', marginTop: '0.85rem', padding: '0.9rem' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
                            Custom specifications
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem 1.25rem' }}>
                            {getOrderItemOptions(item.customOptions).map(([key, value]) => (
                              <div key={key} style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.15rem' }}>
                                  {formatOptionLabel(key)}
                                </div>
                                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.35, overflowWrap: 'break-word' }}>
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Addresses</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Shipping Address
                    </div>
                    {formatAddress(ship)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Billing Address
                    </div>
                    {billDiff ? formatAddress(bill) : <em style={{ color: 'var(--text-muted)' }}>Same as shipping address</em>}
                  </div>
                </div>
              </div>
            </div>

            <aside className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Customer
                  </div>
                  <div style={{ fontWeight: 700 }}>{order.user?.name ?? 'Unknown User'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                </div>
                {sc && (
                  <span style={{ background: sc.bg, color: sc.color, padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                )}
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div className="form-group">
                  <label className="form-label">Order Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    disabled={isDelivered || saving}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>{STATUS_LABELS[option] || option}</option>
                    ))}
                  </select>
                  {isDelivered && (
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Delivered orders are locked.
                    </p>
                  )}
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <button type="submit" className="btn btn-primary" disabled={isDelivered || saving || status === order.status}>
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </form>

              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Delivery Charge</span>
                  <span>${(order.deliveryCharge || 0).toFixed(2)}</span>
                </div>
                {discount > 0.01 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: 'var(--brand-secondary)', fontWeight: 800, paddingTop: '0.65rem', borderTop: '1px solid var(--gray-100)' }}>
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Paid via {order.paymentMethod || 'COD'}
                </div>
              </div>

              {order.notes && (
                <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {order.notes}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => downloadOrderDetails(order, logoUrl, siteName)} className="btn btn-outline btn-sm">
                  Order Details
                </button>
                <button type="button" onClick={() => downloadInvoice(order, logoUrl, siteName)} className="btn btn-outline btn-sm">
                  Invoice
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
