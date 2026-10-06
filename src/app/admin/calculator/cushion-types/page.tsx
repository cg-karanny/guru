'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../../admin.module.css';

const DEFAULT_MARGIN = 4.5;

export default function MarginManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [margin, setMargin] = useState(String(DEFAULT_MARGIN));
  const [initialMargin, setInitialMargin] = useState(DEFAULT_MARGIN);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const savedMargin = Number(data.calculatorMarginMultiplier ?? data.marginMultiplier);
        const nextMargin = Number.isFinite(savedMargin) && savedMargin > 0 ? savedMargin : DEFAULT_MARGIN;
        setMargin(String(nextMargin));
        setInitialMargin(nextMargin);
      })
      .catch(() => {
        setMargin(String(DEFAULT_MARGIN));
        setInitialMargin(DEFAULT_MARGIN);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const nextMargin = Number(margin);
    if (!Number.isFinite(nextMargin) || nextMargin <= 0) {
      setMessage({ type: 'error', text: 'Enter a margin multiplier greater than 0.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculatorMarginMultiplier: nextMargin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save margin.');

      setInitialMargin(nextMargin);
      setMessage({ type: 'success', text: 'Margin multiplier saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save margin.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  const numericMargin = Number(margin);
  const previewMargin = Number.isFinite(numericMargin) && numericMargin > 0 ? numericMargin : initialMargin;
  const sampleBaseCost = 100;
  const sampleTies = 20;
  const sampleTotal = (sampleBaseCost * previewMargin) + sampleTies;

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Margin Management</h1>
          <Link href="/admin/calculator" className="btn btn-outline btn-sm">Back to Calculator</Link>
        </div>

        <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-primary)', marginBottom: '.5rem' }}>
            Calculator Margin Multiplier
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '1.25rem' }}>
            This controls the customer calculator formula: total price = (base cost x margin multiplier) + ties cost.
          </p>

          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: '1 1 220px' }}>
                <label className="form-label">Margin Multiplier</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  value={margin}
                  onChange={e => setMargin(e.target.value)}
                  placeholder="4.5"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Margin'}
              </button>
            </div>

            {message && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
                {message.text}
              </div>
            )}
          </form>
        </section>

        <section className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-primary)', marginBottom: '1rem' }}>
            Price Formula Preview
          </h2>
          <div style={{ display: 'grid', gap: '.75rem', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Base cost example</span>
              <strong>${sampleBaseCost.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Margin multiplier</span>
              <strong>{previewMargin.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>Ties example</span>
              <strong>${sampleTies.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '.75rem' }}>
              <span>Sample total</span>
              <strong>${sampleTotal.toFixed(2)}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
