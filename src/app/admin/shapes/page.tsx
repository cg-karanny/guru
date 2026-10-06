'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../admin.module.css';

const SHAPE_KEYS = [
  { key: 'Squared Corners', label: 'Squared Corners' },
  { key: 'Squared Corners 2', label: 'Squared Corners 2' },
  { key: 'Squared Corners 3', label: 'Squared Corners 3' },
  { key: 'Rounded Corners', label: 'Rounded Corners' },
  { key: 'Rounded Front', label: 'Rounded Front' },
  { key: 'Rounded Back', label: 'Rounded Back' },
  { key: 'Trapezoid', label: 'Trapezoid' },
  { key: 'Rectangle 1 Break', label: 'Rectangle 1 Break' },
  { key: 'Rectangle 2 Breaks', label: 'Rectangle 2 Breaks' },
  { key: 'Rectangle 3 Breaks', label: 'Rectangle 3 Breaks' },
  { key: 'Rounded Rectangle 1 Break', label: 'Rounded Rectangle 1 Break' },
  { key: 'Rounded Rectangle 2 Breaks', label: 'Rounded Rectangle 2 Breaks' },
  { key: 'Rounded Rectangle 3 Breaks', label: 'Rounded Rectangle 3 Breaks' },
  { key: 'Circle', label: 'Circle' },
  { key: 'Outer Bottom Corners Rounded', label: 'Outer Bottom Corners Rounded' },
  { key: 'All Bottom Corners Rounded', label: 'All Bottom Corners Rounded' },
  { key: 'Outer Top Corners Rounded', label: 'Outer Top Corners Rounded' },
  { key: 'All Top Corners Rounded', label: 'All Top Corners Rounded' },
  { key: 'Outer Corners Rounded', label: 'Outer Corners Rounded' },
  { key: 'All Corners Rounded', label: 'All Corners Rounded' },
  { key: '1 Seat 1 Back', label: '1 Seat 1 Back' },
  { key: '1 Seat 2 Back', label: '1 Seat 2 Back' },
  { key: '2 Seat 1 Back', label: '2 Seat 1 Back' },
  { key: '2 Seat 2 Back', label: '2 Seat 2 Back' },
  { key: '3 Seat 1 Back', label: '3 Seat 1 Back' },
  { key: '3 Seat 3 Back', label: '3 Seat 3 Back' },
  { key: '2 Outer Bottom Corners Rounded', label: '2 Outer Bottom Corners Rounded' },
  { key: '2 Outer Corners Rounded', label: '2 Outer Corners Rounded' },
  { key: '2 Outer Top Corners Rounded', label: '2 Outer Top Corners Rounded' },
  { key: '3 All Front Corners Rounded', label: '3 All Front Corners Rounded' },
  { key: '3 All Back Corners Rounded', label: '3 All Back Corners Rounded' },
  { key: '3 All Bottom Corners Rounded', label: '3 All Bottom Corners Rounded' },
  { key: '3 All Corners Rounded', label: '3 All Corners Rounded' },
  { key: '3 Outer Back Corners Rounded', label: '3 Outer Back Corners Rounded' },
  { key: '3 Outer Front Corners Rounded', label: '3 Outer Front Corners Rounded' },
  { key: '3 Outer Top Corners Rounded', label: '3 Outer Top Corners Rounded' },
];

type MediaItem = {
  key: string;
  url: string;
};

const optionKey = (key: string) => key.toLowerCase().replace(/ /g, '_');
const shapeMediaKey = (key: string) => `shape_${optionKey(key)}`;

export default function AdminShapePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shapeKey, setShapeKey] = useState(SHAPE_KEYS[0].key);
  const [shapeFile, setShapeFile] = useState<File | null>(null);
  const [shapeUploading, setShapeUploading] = useState(false);
  const [shapeMsg, setShapeMsg] = useState('');
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({});
  const [imagesLoading, setImagesLoading] = useState(true);
  const shapeImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  const loadShapeImages = () => {
    setImagesLoading(true);
    fetch('/api/media?prefix=shape_', { cache: 'no-store' })
      .then(res => res.json())
      .then((items: MediaItem[]) => {
        const map: Record<string, string> = {};
        if (Array.isArray(items)) {
          items.forEach(item => {
            map[item.key] = item.url;
          });
        }
        setShapeImages(map);
      })
      .catch(() => setShapeImages({}))
      .finally(() => setImagesLoading(false));
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadShapeImages();
    }
  }, [user]);

  const handleShapeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shapeKey || !shapeFile) {
      setShapeMsg('Select a shape and an image file.');
      return;
    }

    setShapeUploading(true);
    setShapeMsg('');

    const fd = new FormData();
    fd.append('file', shapeFile);
    fd.append('key', shapeMediaKey(shapeKey));
    fd.append('type', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setShapeMsg(`Shape image uploaded for ${shapeKey}`);
      setShapeImages(prev => ({ ...prev, [shapeMediaKey(shapeKey)]: data.url }));
      setShapeFile(null);
      if (shapeImgRef.current) shapeImgRef.current.value = '';
      loadShapeImages();
    } catch (err) {
      setShapeMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setShapeUploading(false);
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
          <h1>Shape Images</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
            Shape Images (Customize Page Step 1)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
            Upload one image per shape. It will appear in the shape selector for customers.
          </p>
          <div className="card" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleShapeUpload}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Shape</label>
                  <select className="form-control" value={shapeKey} onChange={e => setShapeKey(e.target.value)}>
                    {SHAPE_KEYS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Image File</label>
                  <input
                    ref={shapeImgRef}
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={e => setShapeFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={shapeUploading}
                  style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}
                >
                  {shapeUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
              {shapeMsg && (
                <div
                  className={`alert ${shapeMsg.includes('uploaded') ? 'alert-success' : 'alert-error'}`}
                  style={{ marginTop: '.75rem' }}
                >
                  {shapeMsg}
                </div>
              )}
            </form>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--brand-primary)' }}>
            Uploaded Shape Images
          </h2>

          {imagesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading shape images...</p>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {SHAPE_KEYS.map(shape => {
                const imageUrl = shapeImages[shapeMediaKey(shape.key)];
                return (
                  <div key={shape.key} className="card" style={{ padding: '1rem' }}>
                    <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', marginBottom: '.75rem' }}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={shape.label}
                          fill
                          sizes="(max-width: 768px) 50vw, 180px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '.85rem', textAlign: 'center', padding: '1rem' }}>
                          No image uploaded
                        </div>
                      )}
                    </div>
                    <strong style={{ display: 'block', color: 'var(--brand-primary)', marginBottom: '.25rem' }}>{shape.label}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{shapeMediaKey(shape.key)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
