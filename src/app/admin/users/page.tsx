'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



const statusColor: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fff7ed', color: '#f59e0b' },
  PROCESSING: { bg: '#eff6ff', color: '#3b82f6' },
  SHIPPED: { bg: '#f5f3ff', color: '#8b5cf6' },
  DELIVERED: { bg: '#f0fdf4', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
};

export default function AdminUsersPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    } else if (user?.role === 'ADMIN') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setUsersList(data); setDataLoading(false); })
        .catch(err => { console.error(err); setDataLoading(false); });
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const filtered = usersList.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Users Data</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{usersList.length} users</span>
            <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        {/* Users table */}
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <div style={{ minWidth: '800px' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '1rem', padding: '1rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Orders</span>
              <span>Joined</span>
            </div>

            {dataLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
            ) : null}

            {filtered.map((u, idx) => {
              const isExpanded = expanded === u.id;
              return (
                <div key={u.id}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : u.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto auto auto',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--gray-100)',
                      cursor: 'pointer',
                      background: isExpanded ? 'var(--gray-50)' : (idx % 2 === 0 ? 'white' : 'var(--off-white)'),
                      transition: 'background 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name || '—'}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</span>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: u.role === 'ADMIN' ? '#fef3c7' : '#f0fdf4',
                      color: u.role === 'ADMIN' ? '#92400e' : '#166534',
                    }}>{u.role}</span>
                    <span style={{ textAlign: 'center', fontWeight: 700, color: u.orders?.length > 0 ? 'var(--brand-secondary)' : 'var(--text-muted)' }}>
                      {u.orders?.length ?? 0}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem 2rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Orders */}
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--brand-primary)' }}>Orders ({u.orders?.length ?? 0})</h3>
                          {!u.orders?.length ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No orders placed yet.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                              {u.orders.map((order: any) => {
                                const sc = statusColor[order.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                                return (
                                  <div key={order.id} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{order.id.slice(-8).toUpperCase()}</span>
                                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <span style={{ background: sc.bg, color: sc.color, padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{order.status}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--brand-secondary)' }}>${order.total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                      {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                      {(order.items as any[])?.map((item: any, idx: number) => (
                                        <span key={idx} style={{ background: 'var(--gray-100)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          {item.quantity}× {item.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Cart */}
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--brand-primary)' }}>Current Cart</h3>
                          {!u.cartData || (u.cartData as any[]).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Cart is empty.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {(u.cartData as any[]).map((item: any, idx: number) => (
                                <div key={idx} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                  <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                    {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.category === 'Non-Customizable' ? '🛍️' : '🛋️')}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category ?? 'Custom'} · Qty: {item.quantity} · ${item.price?.toFixed(2)} each</div>
                                  </div>
                                  <span style={{ fontWeight: 700, color: 'var(--brand-secondary)', whiteSpace: 'nowrap' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
