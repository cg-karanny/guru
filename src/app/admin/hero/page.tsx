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

const HERO_IMAGE_WIDTH = 1920;
const HERO_IMAGE_HEIGHT = 900;

export default function AdminHeroPage() {
  const { user, loading, refreshMedia, mediaCache, updateMediaCache } = useAuth();
  const router = useRouter();

  const [heroKey, setHeroKey] = useState(HERO_BANNERS[0].key);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [currentHeroUrl, setCurrentHeroUrl] = useState('');
  const [currentHeroLoading, setCurrentHeroLoading] = useState(false);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState('');
  const [heroImageSize, setHeroImageSize] = useState<{ width: number; height: number } | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroMsg, setHeroMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayHeroUrl = heroPreviewUrl || currentHeroUrl;
  const currentHeroLabel = HERO_BANNERS.find(b => b.key === heroKey)?.label;

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  useEffect(() => {
    let ignore = false;

    async function loadCurrentHero() {
      setCurrentHeroLoading(true);
      setCurrentHeroUrl(mediaCache[heroKey] || '');

      if (mediaCache[heroKey]) {
        setCurrentHeroLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/media/${heroKey}?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (!ignore) setCurrentHeroUrl(data?.url || '');
      } catch {
        if (!ignore) setCurrentHeroUrl('');
      } finally {
        if (!ignore) setCurrentHeroLoading(false);
      }
    }

    loadCurrentHero();

    return () => {
      ignore = true;
    };
  }, [heroKey, mediaCache]);

  useEffect(() => {
    if (!heroFile) {
      setHeroPreviewUrl('');
      setHeroImageSize(null);
      return;
    }

    const objectUrl = URL.createObjectURL(heroFile);
    const image = new window.Image();
    image.onload = () => {
      setHeroImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = objectUrl;
    setHeroPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [heroFile]);

  const handleHeroUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroKey || !heroFile) {
      setHeroMsg('Select a slider and an image file.');
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
      setHeroMsg(`Hero image uploaded for ${HERO_BANNERS.find(b => b.key === heroKey)?.label}`);
      if (data.url) {
        setCurrentHeroUrl(data.url);
        updateMediaCache(heroKey, data.url);
      }
      setHeroFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (refreshMedia) refreshMedia();
    } catch (err: unknown) {
      setHeroMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Hero Banner Management</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
            Hero Slider Banners
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
            Upload the main hero background image for each slide in the homepage Hero Slider.
          </p>

          <div className="card" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleHeroUpload}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                }}
              >
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '.25rem' }}>
                    Hero placeholder size
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
                    Recommended upload: {HERO_IMAGE_WIDTH} x {HERO_IMAGE_HEIGHT}px. Display area: full width x 80vh on desktop.
                  </span>
                </div>
                <div
                  style={{
                    minWidth: '150px',
                    padding: '.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#fff',
                    border: '1px solid var(--gray-200)',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                  }}
                >
                  {HERO_IMAGE_WIDTH}px W x {HERO_IMAGE_HEIGHT}px H
                </div>
              </div>

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
                  {heroUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label">{heroPreviewUrl ? 'New Hero Image' : 'Current Hero Image'}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div
                    style={{
                      position: 'relative',
                      flex: '1 1 320px',
                      maxWidth: '520px',
                      aspectRatio: `${HERO_IMAGE_WIDTH} / ${HERO_IMAGE_HEIGHT}`,
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)',
                      background: '#eef2f7',
                    }}
                  >
                    {displayHeroUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayHeroUrl}
                          alt={`${currentHeroLabel} hero`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {heroPreviewUrl && (
                          <span
                            style={{
                              position: 'absolute',
                              left: '.75rem',
                              top: '.75rem',
                              padding: '.35rem .65rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(0, 0, 0, .62)',
                              color: '#fff',
                              fontSize: '.75rem',
                              fontWeight: 700,
                            }}
                          >
                            Ready to upload
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ position: 'absolute', right: '.75rem', bottom: '.75rem' }}
                        >
                          Change Image
                        </button>
                      </>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '.5rem',
                          color: 'var(--text-muted)',
                          textAlign: 'center',
                          padding: '1rem',
                        }}
                      >
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {currentHeroLoading ? 'Loading image...' : 'No image uploaded yet'}
                        </strong>
                        <span>{HERO_IMAGE_WIDTH}px W x {HERO_IMAGE_HEIGHT}px H placeholder</span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose Image
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: '1 1 220px', color: 'var(--text-muted)', fontSize: '.875rem' }}>
                    <p style={{ margin: '0 0 .35rem' }}>
                      Editing: <strong style={{ color: 'var(--text-primary)' }}>
                        {currentHeroLabel}
                      </strong>
                    </p>
                    {heroPreviewUrl && (
                      <p style={{ margin: '0 0 .35rem' }}>
                        Selected file size:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {heroImageSize ? `${heroImageSize.width}px W x ${heroImageSize.height}px H` : 'Reading image...'}
                        </strong>
                      </p>
                    )}
                    <p style={{ margin: 0 }}>
                      {heroPreviewUrl
                        ? 'Click Upload Image to replace this hero with the selected image.'
                        : 'Choose a new background image to edit this hero.'}
                    </p>
                  </div>
                </div>
              </div>

              {heroMsg && (
                <div
                  className={`alert ${heroMsg.startsWith('Hero image uploaded') ? 'alert-success' : 'alert-error'}`}
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
