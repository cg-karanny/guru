'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/account');
  }, [user, loading, router]);

  if (loading || !user) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>{user.name?.[0] ?? user.email[0]}</div>
          <div>
            <h1>Welcome back, {user.name ?? 'Customer'}!</h1>
            <p>{user.email}</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { logout(); router.push('/'); }}>Sign Out</button>
        </div>

        <div className={styles.grid}>
          <Link href="/account/orders" className={styles.dashCard}>
            <div className={styles.cardIcon}>📦</div>
            <h3>My Orders</h3>
            <p>View and track all your cushion orders</p>
            <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/account/details" className={styles.dashCard}>
            <div className={styles.cardIcon}>👤</div>
            <h3>Account Details</h3>
            <p>Update your personal information</p>
            <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/customize" className={styles.dashCard}>
            <div className={styles.cardIcon}>✏️</div>
            <h3>New Order</h3>
            <p>Start customizing a new cushion</p>
            <span className={styles.arrow}>→</span>
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.dashCard} ${styles.adminCard}`}>
              <div className={styles.cardIcon}>⚙️</div>
              <h3>Admin Panel</h3>
              <p>Manage orders, media, and settings</p>
              <span className={styles.arrow}>→</span>
            </Link>
          )}
        </div>

        <RecentOrders />
      </div>
    </div>
  );
}

function RecentOrders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: '#f59e0b',
    PROCESSING: '#3b82f6',
    SHIPPED: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
  };

  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--brand-primary)', margin: 0 }}>Recent Orders</h2>
        <Link href="/account/orders" className="btn btn-outline btn-sm">View All</Link>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No orders yet.</p>
          <Link href="/products" className="btn btn-primary">Shop Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id.slice(-8).toUpperCase()}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    background: `${statusColor[order.status]}20`,
                    color: statusColor[order.status],
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: '1.1rem' }}>${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(order.items as any[])?.map((item: any, idx: number) => (
                  <span key={idx} style={{ background: 'var(--gray-100)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.quantity}× {item.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
