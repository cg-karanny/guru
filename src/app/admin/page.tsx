'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



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

export default function AdminPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, codRevenue: 0, stripeRevenue: 0, subscribers: 0, messages: 0, products: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/newsletter/count').then(r => r.json()).catch(() => ({ count: 0 })),
      fetch('/api/contact/count').then(r => r.json()).catch(() => ({ count: 0 })),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([orders, subs, msgs, prods, users]) => {
      const ordersArr = Array.isArray(orders) ? orders : [];
      const mtdOrders = ordersArr.filter((o: any) => new Date(o.createdAt) >= new Date(startOfMonth));
      
      // Calculate revenue only from DELIVERED orders
      const deliveredOrders = ordersArr.filter((o: any) => o.status === 'DELIVERED');
      const totalRevenue = deliveredOrders.reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const codRevenue = deliveredOrders.filter((o: any) => (o.paymentMethod || 'COD') === 'COD').reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const stripeRevenue = deliveredOrders.filter((o: any) => o.paymentMethod === 'STRIPE').reduce((s: number, o: any) => s + (o.total ?? 0), 0);
        
      setStats({
        orders: ordersArr.length,
        revenue: totalRevenue,
        codRevenue,
        stripeRevenue,
        subscribers: subs?.count ?? 0,
        messages: msgs?.count ?? 0,
        products: Array.isArray(prods) ? prods.length : 0,
        users: Array.isArray(users) ? users.length : 0,
      });
      setRecentOrders(ordersArr.slice(0, 5));
      setProducts(Array.isArray(prods) ? prods.slice(0, 6) : []);
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, [user]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  const statCards = [
    { label: 'Total Orders', value: statsLoading ? '…' : stats.orders, icon: '📦', color: '#1a3c5e', href: '/admin/orders' },
    { label: 'Total Revenue', value: statsLoading ? '…' : `$${stats.revenue.toFixed(2)}`, icon: '💰', color: '#FBB91E', href: '/admin/orders' },
    { label: 'Stripe Revenue', value: statsLoading ? '…' : `$${stats.stripeRevenue.toFixed(2)}`, icon: '💳', color: '#635BFF', href: '/admin/orders' },
    { label: 'COD Revenue', value: statsLoading ? '…' : `$${stats.codRevenue.toFixed(2)}`, icon: '💵', color: '#10b981', href: '/admin/orders' },
    { label: 'Products', value: statsLoading ? '…' : stats.products, icon: '🛍️', color: '#ea580c', href: '/admin/products' },
    { label: 'Users', value: statsLoading ? '…' : stats.users, icon: '👥', color: '#7c3aed', href: '/admin/users' },
    { label: 'Subscribers', value: statsLoading ? '…' : stats.subscribers, icon: '📧', color: '#d4a855', href: '/admin/subscribers' },
    { label: 'Messages', value: statsLoading ? '…' : stats.messages, icon: '✉️', color: '#9333ea', href: '/admin/messages' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Admin Dashboard</h1>
          <span className={styles.timestamp}>
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2.25rem', marginBottom: '3rem' }}>
          {statCards.map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, color: 'var(--brand-primary)' }}>Recent Orders</h2>
            <Link href="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {statsLoading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</div>
          ) : (
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <div style={{ minWidth: '700px' }}>
                {recentOrders.map((order, idx) => {
                  const sc = statusColor[order.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: idx < recentOrders.length - 1 ? '1px solid var(--gray-100)' : 'none', background: idx % 2 === 0 ? 'white' : 'var(--off-white)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{order.id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user?.name ?? order.user?.email ?? 'Customer'}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{order.status}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--brand-secondary)', whiteSpace: 'nowrap' }}>${order.total.toFixed(2)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{order.paymentMethod || 'COD'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, color: 'var(--brand-primary)' }}>Products</h2>
            <Link href="/admin/products" className="btn btn-outline btn-sm">Manage</Link>
          </div>
          {statsLoading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products yet. <Link href="/admin/products">Add one →</Link></div>
          ) : (
            <div className="grid-3" style={{ gap: '1.25rem' }}>
              {products.map(product => (
                <div key={product.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>🛍️</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {product.sku}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-secondary)' }}>${(product.sellingPrice || product.listingPrice)?.toFixed(2)}</span>
                      {product.listingPrice > product.sellingPrice && <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>${product.listingPrice?.toFixed(2)}</span>}
                      {product.listingPrice > product.sellingPrice && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                          ↓ {Math.round(((product.listingPrice - product.sellingPrice) / product.listingPrice) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
