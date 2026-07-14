'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



const HERO_BANNERS = [
  { key: 'home_slider_indoor', label: 'Indoor Cushions Hero' },
  { key: 'home_slider_outdoor', label: 'Outdoor Cushions Hero' },
  { key: 'home_slider_rv', label: 'RV Cushions Hero' },
  { key: 'home_slider_boat', label: 'Boat Cushions Hero' },
  { key: 'home_slider_pet-bed', label: 'Pet Bed Hero' },
];

export default function AdminHeroPage() {
  const { user, logout, loading, refreshMedia } = useAuth();
  const router = useRouter();

  const [heroKey, setHeroKey] = useState(HERO_BANNERS[0].key);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroMsg, setHeroMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  const handleHeroUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroKey || !heroFile) {
      setHeroMsg('❌ Select a slider and an image file.');
      return;
    }
    setHeroUploading(true);
    setHeroMsg('');

    const fd = new FormData();
    fd.append('file', heroFile);
    fd.append('key', heroKey);
    fd.append('type', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setHeroMsg(`✅ Hero image uploaded for ${HERO_BANNERS.find(b => b.key === heroKey)?.label}`);
      setHeroFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (refreshMedia) refreshMedia();
    } catch (err: any) {
      setHeroMsg(`❌ ${err.message}`);
    } finally {
      setHeroUploading(false);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Hero Banner Management</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
            🖼️ Hero Slider Banners
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
            Upload the main hero background image for each slide in the hompeage Hero Slider.
          </p>
          <div className="card" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleHeroUpload}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Slider Image</label>
                  <select className="form-control" value={heroKey} onChange={e => setHeroKey(e.target.value)}>
                    {HERO_BANNERS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Background Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={e => setHeroFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={heroUploading}
                  style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}
                >
                  {heroUploading ? 'Uploading…' : 'Upload Image'}
                </button>
              </div>
              {heroMsg && (
                <div
                  className={`alert ${heroMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
                  style={{ marginTop: '.75rem' }}
                >
                  {heroMsg}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
