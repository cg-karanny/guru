'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



interface FabricItem {
  id: string;
  fabricId: string;
  label: string;
  price: number;
  imageUrl: string;
}

interface FabricBrand {
  id: string;
  name: string;
  fabrics: FabricItem[];
}

export default function AdminFabricsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [brands, setBrands] = useState<FabricBrand[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [hoveredFabricId, setHoveredFabricId] = useState<string | null>(null);

  // Bulk upload form
  const [brandName, setBrandName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErr, setUploadErr] = useState('');

  // Shape image upload
  const [shapeKey, setShapeKey] = useState('Rectangle');
  const [shapeFile, setShapeFile] = useState<File | null>(null);
  const [shapeUploading, setShapeUploading] = useState(false);
  const [shapeMsg, setShapeMsg] = useState('');

  const csvInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const shapeImgRef = useRef<HTMLInputElement>(null);

  const SHAPE_KEYS = [
    { key: 'Rectangle', label: 'Throw Pillow' },
    { key: 'Box', label: 'Rectangle' },
    { key: 'Trapezium', label: 'Trapezium' },
    { key: 'T Cushion', label: 'T Cushion' },
    { key: 'L Shape', label: 'L Shape' },
    { key: 'Triangle', label: 'Triangle' },
    { key: 'Round', label: 'Round' },
    { key: 'Pillow', label: 'Pillow' }
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    } else if (user?.role === 'ADMIN') {
      loadBrands();
    }
  }, [user, loading, router]);

  const loadBrands = () => {
    setDataLoading(true);
    fetch('/api/fabrics')
      .then(r => r.json())
      .then((data: FabricBrand[]) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !csvFile || imageFiles.length === 0) {
      setUploadErr('Please provide brand name, CSV file, and at least one image.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    setUploadMsg('');

    const fd = new FormData();
    fd.append('brandName', brandName);
    fd.append('csv', csvFile);
    imageFiles.forEach(img => fd.append('images', img));

    try {
      const res = await fetch('/api/fabrics', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadMsg(`✅ Uploaded ${data.created?.length ?? 0} fabrics to brand "${data.brand}"`);
      setBrandName('');
      setCsvFile(null);
      setImageFiles([]);
      if (csvInputRef.current) csvInputRef.current.value = '';
      if (imgInputRef.current) imgInputRef.current.value = '';
      loadBrands();
    } catch (err: any) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleShapeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shapeKey || !shapeFile) {
      setShapeMsg('❌ Select a shape and an image file.');
      return;
    }
    setShapeUploading(true);
    setShapeMsg('');

    const fd = new FormData();
    fd.append('file', shapeFile);
    fd.append('key', `shape_${shapeKey.toLowerCase().replace(/ /g, '_')}`);
    fd.append('type', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setShapeMsg(`✅ Shape image uploaded for ${shapeKey}`);
      setShapeFile(null);
      if (shapeImgRef.current) shapeImgRef.current.value = '';
    } catch (err: any) {
      setShapeMsg(`❌ ${err.message}`);
    } finally {
      setShapeUploading(false);
    }
  };

  const handleDeleteFabric = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fabric?')) return;
    try {
      const res = await fetch(`/api/fabrics?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete fabric');
      }
      loadBrands(); // refresh
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting fabric');
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
          <h1>Fabric Management</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>

        {/* ── Shape Image Upload ─────────────────────── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
            🔷 Shape Images (Customize Page Step 1)
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
                  {shapeUploading ? 'Uploading…' : 'Upload Image'}
                </button>
              </div>
              {shapeMsg && (
                <div
                  className={`alert ${shapeMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
                  style={{ marginTop: '.75rem' }}
                >
                  {shapeMsg}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* ── Bulk Fabric Upload ─────────────────────── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
            🧵 Bulk Fabric Upload
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
            CSV columns: <code style={{ background: 'var(--gray-100)', padding: '.1rem .4rem', borderRadius: '4px' }}>id, label, price</code> — Image filenames must match the <code style={{ background: 'var(--gray-100)', padding: '.1rem .4rem', borderRadius: '4px' }}>id</code> column (e.g. <code style={{ background: 'var(--gray-100)', padding: '.1rem .4rem', borderRadius: '4px' }}>canvas-natural.jpg</code> for id <code style={{ background: 'var(--gray-100)', padding: '.1rem .4rem', borderRadius: '4px' }}>canvas-natural</code>).
          </p>
          <div className="card" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Brand / Collection Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sunbrella"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">CSV Dataset * (id, label, price)</label>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="form-control"
                    onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Fabric Images * (select all)</label>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control"
                    onChange={e => setImageFiles(Array.from(e.target.files ?? []))}
                  />
                </div>
              </div>

              {imageFiles.length > 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginBottom: '.75rem' }}>
                  {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}

              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading…' : '📤 Upload Collection'}
              </button>

              {uploadMsg && <div className="alert alert-success" style={{ marginTop: '.75rem' }}>{uploadMsg}</div>}
              {uploadErr && <div className="alert alert-error" style={{ marginTop: '.75rem' }}>❌ {uploadErr}</div>}
            </form>
          </div>
        </section>

        {/* ── Existing Brands ────────────────────────── */}
        <section>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--brand-primary)' }}>
            Fabric Collections ({brands.length})
          </h2>
          {dataLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : brands.length === 0 ? (
            <div className="alert alert-info">No fabric brands uploaded yet.</div>
          ) : (
            brands.map(brand => {
              const isExpanded = expandedBrands[brand.id];
              const visibleFabs = isExpanded ? brand.fabrics : brand.fabrics.slice(0, 36);
              return (
                <div key={brand.id} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--brand-primary)', margin: 0 }}>{brand.name}</h3>
                    <span style={{ fontSize: '.8rem', background: 'var(--brand-light)', color: 'var(--brand-primary)', padding: '.2rem .6rem', borderRadius: '999px', fontWeight: 700 }}>
                      {brand.fabrics.length} fabric{brand.fabrics.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '.5rem' }}>
                    {visibleFabs.map(fab => (
                      <div
                        key={fab.id}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', position: 'relative' }}
                        onMouseEnter={() => setHoveredFabricId(fab.id)}
                        onMouseLeave={() => setHoveredFabricId(null)}
                      >
                        {hoveredFabricId === fab.id && (
                          <button
                            onClick={() => handleDeleteFabric(fab.id)}
                            style={{
                              position: 'absolute',
                              top: '40%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              zIndex: 10,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                        {fab.imageUrl ? (
                          <img
                            src={fab.imageUrl}
                            alt={fab.label}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--gray-200)', opacity: hoveredFabricId === fab.id ? 0.7 : 1, transition: 'opacity 0.2s' }}
                          />
                        ) : (
                          <div style={{ width: '100%', aspectRatio: '1', background: 'var(--gray-100)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: hoveredFabricId === fab.id ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                            🧵
                          </div>
                        )}
                        <span style={{ fontSize: '.6rem', color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2 }}>
                          {fab.label}
                        </span>
                        <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--brand-secondary)' }}>
                          ${fab.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!isExpanded && brand.fabrics.length > 36 && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => setExpandedBrands(prev => ({ ...prev, [brand.id]: true }))}
                    >
                      View All {brand.fabrics.length} Fabrics
                    </button>
                  )}
                  {isExpanded && brand.fabrics.length > 36 && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => setExpandedBrands(prev => ({ ...prev, [brand.id]: false }))}
                    >
                      Show Less
                    </button>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
