'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../admin.module.css';

const pricingSections = [
  {
    title: 'Final Price',
    value: '(sewing + fill + piping + fabric) x 4.5 + ties',
    note: 'This is the live customer calculator formula used on the customize page.',
  },
  {
    title: 'Fabric Cost',
    value: 'selected fabric price x fabric meters x quantity',
    note: 'Fabric prices are managed from Fabric Management.',
  },
  {
    title: 'Sewing Cost',
    value: 'Based on max dimension tiers from 24 in to 120 in',
    note: 'Quantity multiplies the sewing tier cost.',
  },
  {
    title: 'Fill Cost',
    value: 'Based on fill type, shape, size, thickness, and quantity',
    note: 'High Density Foam, Dry Fast Foam, Fiberfill, and Covers Only are supported.',
  },
];

const quickLinks = [
  { href: '/customize', label: 'Open Customer Calculator' },
  { href: '/admin/fabrics', label: 'Manage Fabric Prices' },
  { href: '/admin/products', label: 'Manage Products' },
];

export default function AdminCalculatorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Calculator Management</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
          Calculator rules are currently stored in the customer customize page code. This screen gives admins a central place to review the live pricing logic and jump to related management areas.
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {pricingSections.map(section => (
            <div key={section.title} className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--brand-primary)', marginBottom: '.65rem' }}>{section.title}</h2>
              <p style={{ fontWeight: 700, marginBottom: '.65rem' }}>{section.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', margin: 0 }}>{section.note}</p>
            </div>
          ))}
        </section>

        <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} className="btn btn-outline btn-sm">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', marginBottom: '1rem' }}>Managed Values</h2>
          <div style={{ display: 'grid', gap: '.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '.85rem' }}>
              <strong>Fabric prices</strong>
              <span style={{ color: 'var(--text-muted)' }}>Fabric Management</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '.85rem' }}>
              <strong>Shape images</strong>
              <span style={{ color: 'var(--text-muted)' }}>Fabric Management</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <strong>Formula rates</strong>
              <span style={{ color: 'var(--text-muted)' }}>Code based</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
