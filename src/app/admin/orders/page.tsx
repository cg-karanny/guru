'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';

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

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

type AdminOrderItem = {
  quantity: number;
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
  items: AdminOrderItem[];
};

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setDataLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    } else if (user?.role === 'ADMIN') {
      const frame = requestAnimationFrame(fetchOrders);
      return () => cancelAnimationFrame(frame);
    }
  }, [user, loading, router, fetchOrders]);

  const filtered = orders.filter(order => {
    const matchesStatus = filter === 'ALL' || order.status === filter;
    const matchesPayment = paymentFilter === 'ALL' || (order.paymentMethod || 'COD') === paymentFilter;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search
      || order.id.toLowerCase().includes(search)
      || order.user?.name?.toLowerCase().includes(search)
      || order.user?.email?.toLowerCase().includes(search);

    return matchesStatus && matchesPayment && matchesSearch;
  });

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Orders</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{orders.length} total</span>
            <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <input
              className="form-control"
              type="search"
              placeholder="Search order ID, customer, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="form-control"
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">All payments</option>
              <option value="COD">COD</option>
              <option value="STRIPE">Stripe</option>
            </select>
            <select
              className="form-control"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {dataLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No orders found{filter !== 'ALL' ? ` with status "${filter}"` : ''}.
            </div>
          ) : null}

          {filtered.map(order => {
            const sc = statusColor[order.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
            const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            return (
              <div key={order.id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                      Order #{order.id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>{order.user?.name ?? order.user?.email ?? 'Unknown User'}</strong>
                      {' - '}{order.user?.email}
                      {' - '}{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' - '}{itemCount} item{itemCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ background: sc.bg, color: sc.color, padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: '1.25rem' }}>
                        ${order.total.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {order.paymentMethod || 'COD'}
                      </div>
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}/edit`}
                      className="btn btn-outline btn-sm"
                      title="Edit order"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <EditIcon /> Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
