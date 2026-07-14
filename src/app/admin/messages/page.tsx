'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    } else if (user?.role === 'ADMIN') {
      fetchMessages();
    }
  }, [user, loading, router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      setDataLoading(false);
    } catch (err) {
      console.error(err);
      setDataLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentStatus })
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const filtered = messages.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Messages</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{messages.length} messages</span>
            <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search messages by name, email, or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <div style={{ minWidth: '800px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2.5fr auto auto', gap: '1rem', padding: '1rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Name / Email</span>
              <span>Date</span>
              <span>Message</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {dataLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading messages...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No messages found.</div>
            ) : null}

            {filtered.map((m, idx) => (
              <div key={m.id} style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 2.5fr auto auto',
                gap: '1rem',
                padding: '1.5rem',
                alignItems: 'start',
                borderBottom: '1px solid var(--gray-100)',
                background: m.isRead ? (idx % 2 === 0 ? 'white' : 'var(--off-white)') : '#f0f9ff',
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{m.name || '—'}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <a href={`mailto:${m.email}`} style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>{m.email}</a>
                  </span>
                </div>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.2rem' }}>
                  {new Date(m.createdAt).toLocaleDateString()}
                  <br />
                  <span style={{ fontSize: '0.75rem' }}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                </span>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {m.message}
                </div>

                <div style={{ paddingTop: '0.2rem' }}>
                  <span style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: m.isRead ? '#f1f5f9' : '#dbeafe',
                    color: m.isRead ? '#64748b' : '#1e40af',
                  }}>
                    {m.isRead ? 'Read' : 'New'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => toggleReadStatus(m.id, m.isRead)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                    Mark {m.isRead ? 'Unread' : 'Read'}
                  </button>
                  <button onClick={() => deleteMessage(m.id)} className="btn btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b', border: 'none' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
