'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



const SHAPE_OPTIONS = ['Rectangle', 'Trapezium', 'T-Cushion', 'L-Shape', 'Triangle', 'Round'];
const TYPE_OPTIONS = ['Indoor', 'Outdoor', 'RV', 'Boat', 'Pet-Bed'];

type BlockType = 'paragraph' | 'heading' | 'bullet' | 'gap';
interface ContentBlock { id: string; type: BlockType; text: string; }
interface FaqItem { id: string; q: string; a: string; }
function uid() { return Math.random().toString(36).slice(2, 9); }

// ─────────────────────────────────────────────────────────────────
// INLINE FORMATTING TOOLBAR
// Wraps selected text in **bold** / _italic_ / __underline__ markers
// ─────────────────────────────────────────────────────────────────
function InlineToolbar({ textareaRef, onChange }: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (val: string) => void;
}) {
  const wrap = (prefix: string, suffix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    if (s === e) { alert('Select some text first, then click the format button.'); return; }
    const selected = value.slice(s, e);
    const newVal = value.slice(0, s) + prefix + selected + suffix + value.slice(e);
    onChange(newVal);
    // Restore caret after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + prefix.length, e + prefix.length);
    });
  };
  const btnStyle = (label: string, color: string): React.CSSProperties => ({
    padding: '2px 8px', fontSize: '0.78rem', fontWeight: 800,
    border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer',
    background: 'white', color, fontFamily: label === 'B' ? 'serif' : label === 'I' ? 'serif' : 'sans-serif',
    fontStyle: label === 'I' ? 'italic' : 'normal',
    textDecoration: label === 'U' ? 'underline' : 'none',
  });
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
      <button type="button" style={btnStyle('B', '#1e40af')} onClick={() => wrap('**', '**')} title="Bold: **text**">B</button>
      <button type="button" style={btnStyle('I', '#7c3aed')} onClick={() => wrap('_', '_')} title="Italic: _text_">I</button>
      <button type="button" style={btnStyle('U', '#0e7490')} onClick={() => wrap('__', '__')} title="Underline: __text__">U</button>
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', alignSelf: 'center', marginLeft: '4px' }}>← select text then click</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RICH DESCRIPTION EDITOR
//  Block types: Paragraph, Heading, Bullet, Gap
//  Inline formatting via toolbar (B / I / U)
// ─────────────────────────────────────────────────────────────────
function RichDescriptionEditor({ blocks, setBlocks }: {
  blocks: ContentBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
}) {
  // One ref per block textarea
  const refs = useRef<Record<string, React.RefObject<HTMLTextAreaElement | null>>>({});
  const getRef = (id: string) => {
    if (!refs.current[id]) refs.current[id] = { current: null };
    return refs.current[id];
  };

  const blockTypeLabels: Record<BlockType, string> = {
    paragraph: '¶ Paragraph',
    heading: 'H Heading',
    bullet: '• Bullet',
    gap: '↕ Gap',
  };
  const addBlock = (type: BlockType) =>
    setBlocks(prev => [...prev, { id: uid(), type, text: '' }]);
  const updateBlock = (id: string, text: string) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  const removeBlock = (id: string) =>
    setBlocks(prev => prev.filter(b => b.id !== id));
  const moveBlock = (id: string, dir: -1 | 1) =>
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr;
    });

  const baseTextarea = (type: BlockType): React.CSSProperties => ({
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px',
    padding: '0.55rem 0.75rem', boxSizing: 'border-box',
    fontSize: type === 'heading' ? '1.05rem' : '0.93rem',
    fontWeight: type === 'heading' ? 700 : 400,
    background: '#fff', resize: 'vertical', lineHeight: 1.6,
  });

  return (
    <div>
      {/* Block type toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {(Object.keys(blockTypeLabels) as BlockType[]).map(t => (
          <button key={t} type="button" onClick={() => addBlock(t)}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--gray-200)', background: '#f0f4f8', cursor: 'pointer', fontWeight: 600 }}>
            + {blockTypeLabels[t]}
          </button>
        ))}
      </div>

      {blocks.length === 0 && (
        <div style={{ padding: '1.5rem', border: '2px dashed var(--gray-200)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Click buttons above to add content blocks
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {blocks.map((block, idx) => (
          <div key={block.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#f8fafc', borderRadius: '8px', padding: '0.6rem', border: '1px solid #e2e8f0' }}>
            {/* Move buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
              <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={idx === 0}
                style={{ padding: '2px 6px', fontSize: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>↑</button>
              <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1}
                style={{ padding: '2px 6px', fontSize: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>↓</button>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {blockTypeLabels[block.type]}
              </div>
              {block.type === 'gap' ? (
                <div style={{ height: '20px', background: 'var(--gray-100)', borderRadius: '4px', border: '1px dashed var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  — Spacing Gap —
                </div>
              ) : (
                <>
                  {/* Inline formatting toolbar */}
                  <InlineToolbar
                    textareaRef={getRef(block.id) as React.RefObject<HTMLTextAreaElement | null>}
                    onChange={(val) => updateBlock(block.id, val)}
                  />
                  <textarea
                    ref={el => { refs.current[block.id] = { current: el }; }}
                    style={baseTextarea(block.type) as any}
                    value={block.text}
                    onChange={e => updateBlock(block.id, e.target.value)}
                    placeholder={
                      block.type === 'heading' ? 'Section heading...' :
                        block.type === 'bullet' ? 'Bullet point...' :
                          'Paragraph text... (select text then B/I/U to format)'
                    }
                    rows={block.type === 'paragraph' ? 3 : 1}
                  />
                </>
              )}
            </div>

            <button type="button" onClick={() => removeBlock(block.id)}
              style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontWeight: 700, marginTop: '1rem' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  FAQ EDITOR
// ─────────────────────────────────────────────────────────────────
function FaqEditor({ faqs, setFaqs }: { faqs: FaqItem[]; setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>> }) {
  const add = () => setFaqs(prev => [...prev, { id: uid(), q: '', a: '' }]);
  const update = (id: string, field: 'q' | 'a', val: string) =>
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
  const remove = (id: string) => setFaqs(prev => prev.filter(f => f.id !== id));
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqs.map((faq, idx) => (
          <div key={faq.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FAQ #{idx + 1}</span>
              <button type="button" onClick={() => remove(faq.id)}
                style={{ padding: '2px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>Remove</button>
            </div>
            <div style={{ marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Question</label>
              <input type="text" className="form-control" value={faq.q} onChange={e => update(faq.id, 'q', e.target.value)} placeholder="Enter the question..." />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Answer</label>
              <textarea className="form-control" value={faq.a} onChange={e => update(faq.id, 'a', e.target.value)} placeholder="Enter the answer..." rows={2} />
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>+ Add FAQ Item</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  LINKED URL INPUT with type= / shape= suggestions
// ─────────────────────────────────────────────────────────────────
function LinkedUrlInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const baseUrl = '/customize';
  const insertParam = (key: string, val: string) => {
    let url = value || baseUrl;
    const [base, qs = ''] = url.split('?');
    const params = new URLSearchParams(qs);
    params.set(key, val.toLowerCase().replace(/\s+/g, '-'));
    onChange(base + '?' + params.toString());
  };
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="text" className="form-control" value={value} onChange={e => onChange(e.target.value)}
          placeholder="e.g. /customize?type=outdoor&shape=round or https://..." style={{ flex: 1 }} />
        <button type="button" onClick={() => setOpen(s => !s)}
          style={{ padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gray-200)', background: open ? '#6366f1' : '#f0f4f8', color: open ? '#fff' : 'inherit', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          🔗 Suggestions
        </button>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 200, background: 'white', border: '1px solid var(--gray-200)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>type=</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {TYPE_OPTIONS.map(t => (
                  <button key={t} type="button" onClick={() => insertParam('type', t)}
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem', borderRadius: '20px', border: '1px solid #6366f1', background: '#eef2ff', color: '#4338ca', cursor: 'pointer', fontWeight: 600 }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>shape=</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {SHAPE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => insertParam('shape', s)}
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem', borderRadius: '20px', border: '1px solid #059669', background: '#ecfdf5', color: '#047857', cursor: 'pointer', fontWeight: 600 }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.45rem 0.7rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.77rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
            <strong>Preview:</strong> {value || '(empty)'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  STOCK BADGE
// ─────────────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Out of Stock</span>;
  if (stock <= 5) return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Almost Gone ({stock})</span>;
  return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>In Stock ({stock})</span>;
}

// ─────────────────────────────────────────────────────────────────
//  COLLAPSIBLE SECTION
// ─────────────────────────────────────────────────────────────────
function CollapsibleSection({ title, open, onToggle, children, hint }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode; hint?: string;
}) {
  return (
    <div style={{ marginBottom: '1.5rem', border: '1px solid var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
      <button type="button" onClick={onToggle}
        style={{ width: '100%', padding: '0.9rem 1.25rem', background: open ? 'var(--brand-primary)' : '#f8fafc', color: open ? 'white' : 'var(--text-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
        <span>{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '1.25rem', background: 'white' }}>
          {hint && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', background: '#f0f9ff', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
              {hint}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'product' | 'linked'>('product');

  // ── Regular Product ──
  const [products, setProducts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [richBlocks, setRichBlocks] = useState<ContentBlock[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [showRich, setShowRich] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // ── Linked Product ──
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [lpName, setLpName] = useState('');
  const [lpLink, setLpLink] = useState('');
  const [lpPrice, setLpPrice] = useState('');
  const [lpDesc, setLpDesc] = useState('');
  const [lpFile, setLpFile] = useState<File | null>(null);
  const [lpEditingId, setLpEditingId] = useState<string | null>(null);
  const [lpSubmitting, setLpSubmitting] = useState(false);
  const [showLinkedForm, setShowLinkedForm] = useState(false);
  const [lpRichBlocks, setLpRichBlocks] = useState<ContentBlock[]>([]);
  const [lpFaqs, setLpFaqs] = useState<FaqItem[]>([]);
  const [lpShowRich, setLpShowRich] = useState(false);
  const [lpShowFaq, setLpShowFaq] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) { router.replace('/account'); return; }
    if (user?.role === 'ADMIN') {
      Promise.all([fetchProducts(), fetchLinked()]).finally(() => setDataLoading(false));
    }
  }, [user, loading]);

  const fetchProducts = () =>
    fetch('/api/products').then(r => r.json()).then(d => { if (Array.isArray(d)) setProducts(d); });
  const fetchLinked = () =>
    fetch('/api/linked-products').then(r => r.json()).then(d => { if (Array.isArray(d)) setLinkedProducts(d); });

  // ── Product handlers ──
  const handleEdit = (p: any) => {
    setEditingId(p.id); setName(p.name); setSku(p.sku);
    setListingPrice(p.listingPrice.toString()); setSellingPrice(p.sellingPrice.toString());
    setDescription(p.description); setStock(p.stock?.toString() ?? '0'); setFile(null);
    try { setRichBlocks(p.richDescription ? JSON.parse(p.richDescription) : []); } catch { setRichBlocks([]); }
    try { setFaqs(p.faqData ? JSON.parse(p.faqData) : []); } catch { setFaqs([]); }
    setShowRich(true); setShowFaq(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleCancel = () => {
    setEditingId(null); setName(''); setSku(''); setListingPrice(''); setSellingPrice('');
    setDescription(''); setStock('0'); setFile(null); setRichBlocks([]); setFaqs([]);
    setShowRich(false); setShowFaq(false);
    const fi = document.getElementById('prodImg') as HTMLInputElement;
    if (fi) fi.value = '';
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !description || !listingPrice || !sellingPrice) { alert('Fill all required fields'); return; }
    if (parseFloat(sellingPrice) >= parseFloat(listingPrice)) { alert('Selling price must be lower than listing price'); return; }
    if (!editingId && !file) { alert('Image required for new product'); return; }
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('name', name); fd.append('sku', sku); fd.append('description', description);
    fd.append('richDescription', JSON.stringify(richBlocks));
    fd.append('faqData', JSON.stringify(faqs));
    fd.append('listingPrice', listingPrice); fd.append('sellingPrice', sellingPrice); fd.append('stock', stock);
    if (file) fd.append('image', file);
    try {
      const res = await fetch(editingId ? `/api/products/${editingId}` : '/api/products', { method: editingId ? 'PUT' : 'POST', body: fd });
      if (res.ok) { alert(editingId ? 'Updated!' : 'Created!'); handleCancel(); fetchProducts(); }
      else { const e = await res.json(); alert(`Error: ${e.message || e.error}`); }
    } catch { alert('Server error'); }
    finally { setIsSubmitting(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProducts(); else alert('Failed to delete');
  };

  // ── Linked product handlers ──
  const handleLpEdit = (lp: any) => {
    setLpEditingId(lp.id); setLpName(lp.name); setLpLink(lp.link);
    setLpPrice(lp.startingPrice.toString()); setLpDesc(lp.description); setLpFile(null);
    try { setLpRichBlocks(lp.richDescription ? JSON.parse(lp.richDescription) : []); } catch { setLpRichBlocks([]); }
    try { setLpFaqs(lp.faqData ? JSON.parse(lp.faqData) : []); } catch { setLpFaqs([]); }
    setLpShowRich(true); setLpShowFaq(true);
    setShowLinkedForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleLpCancel = () => {
    setLpEditingId(null); setLpName(''); setLpLink(''); setLpPrice('');
    setLpDesc(''); setLpFile(null); setLpRichBlocks([]); setLpFaqs([]);
    setLpShowRich(false); setLpShowFaq(false); setShowLinkedForm(false);
  };
  const handleLpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpName || !lpLink || !lpPrice || !lpDesc) { alert('Fill all fields'); return; }
    if (!lpEditingId && !lpFile) { alert('Image required'); return; }
    setLpSubmitting(true);
    const fd = new FormData();
    fd.append('name', lpName); fd.append('link', lpLink);
    fd.append('startingPrice', lpPrice); fd.append('description', lpDesc);
    fd.append('richDescription', JSON.stringify(lpRichBlocks));
    fd.append('faqData', JSON.stringify(lpFaqs));
    if (lpFile) fd.append('image', lpFile);
    try {
      const res = await fetch(lpEditingId ? `/api/linked-products/${lpEditingId}` : '/api/linked-products', { method: lpEditingId ? 'PUT' : 'POST', body: fd });
      if (res.ok) { alert(lpEditingId ? 'Updated!' : 'Created!'); handleLpCancel(); fetchLinked(); }
      else { const e = await res.json(); alert(`Error: ${e.message || e.error}`); }
    } catch { alert('Server error'); }
    finally { setLpSubmitting(false); }
  };
  const handleLpDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    const res = await fetch(`/api/linked-products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchLinked(); else alert('Failed to delete');
  };

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Manage Products</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px', width: 'fit-content' }}>
          {(['product', 'linked'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'linked') setShowLinkedForm(false); }}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
              {tab === 'product' ? '🛍️ Regular Products' : '🔗 Linked Products'}
            </button>
          ))}
        </div>

        {/* ═══════════ REGULAR PRODUCTS ═══════════ */}
        {activeTab === 'product' && (
          <>
            <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)', fontSize: '1.4rem' }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input type="text" className="form-control" value={sku} onChange={e => setSku(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Listing Price ($)</label>
                    <input type="number" step="0.01" className="form-control" value={listingPrice} onChange={e => setListingPrice(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price ($)</label>
                    <input type="number" step="0.01" className="form-control" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input type="number" min="0" className="form-control" value={stock} onChange={e => setStock(e.target.value)} required />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>0 = Out of Stock · 1–5 = Almost Gone · 6+ = In Stock</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Image {editingId && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(leave blank to keep current)</span>}</label>
                    <input id="prodImg" type="file" className="form-control" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} {...(!editingId && { required: true })} style={{ background: 'var(--gray-50)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Short Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(shown on product card)</span></label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={2} required />
                </div>

                <CollapsibleSection title="📝 Rich Description (Product Detail Page)" open={showRich} onToggle={() => setShowRich(s => !s)}
                  hint="Build a rich product page with headings, paragraphs, bullets and spacing. Select text then press B / I / U to apply inline formatting.">
                  <RichDescriptionEditor blocks={richBlocks} setBlocks={setRichBlocks} />
                </CollapsibleSection>

                <CollapsibleSection title="❓ FAQ Section" open={showFaq} onToggle={() => setShowFaq(s => !s)}
                  hint="FAQ items appear on the product detail page. Users click the arrow to reveal each answer.">
                  <FaqEditor faqs={faqs} setFaqs={setFaqs} />
                </CollapsibleSection>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                  </button>
                  {editingId && <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>}
                </div>
              </form>
            </div>

            <h2 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>Existing Products</h2>
            <div className="grid-4" style={{ gap: '1.5rem' }}>
              {products.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {p.imageUrl
                    ? <div style={{ height: '180px', overflow: 'hidden' }}><img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    : <div style={{ height: '180px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛍️</div>}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>{p.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                    <StockBadge stock={p.stock ?? 0} />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--brand-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>${(p.sellingPrice || p.listingPrice)?.toFixed(2)}</span>
                      {p.listingPrice > p.sellingPrice && <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.85rem' }}>${p.listingPrice?.toFixed(2)}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {p.richDescription && <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>✓ Rich</span>}
                      {(() => { try { return JSON.parse(p.faqData || '[]').length > 0 ? <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>✓ FAQ</span> : null; } catch { return null; } })()}
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                      <button onClick={() => handleEdit(p)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)' }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {dataLoading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Loading products...</div>
              ) : products.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No products yet.</p>
              ) : null}
            </div>
          </>
        )}

        {/* ═══════════ LINKED PRODUCTS ═══════════ */}
        {activeTab === 'linked' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--brand-primary)' }}>Linked Products</h2>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Appear on the shop page. Clicking takes the user to your designated link.</p>
              </div>
              <button onClick={() => { setShowLinkedForm(s => !s); if (showLinkedForm) handleLpCancel(); }}
                className={showLinkedForm ? 'btn btn-outline' : 'btn btn-primary'}>
                {showLinkedForm ? '✕ Cancel' : '+ Add Linked Product'}
              </button>
            </div>

            {showLinkedForm && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>{lpEditingId ? 'Edit' : 'New'} Linked Product</h3>
                <form onSubmit={handleLpSubmit}>
                  <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Product Name</label>
                      <input type="text" className="form-control" value={lpName} onChange={e => setLpName(e.target.value)} required placeholder="e.g. Outdoor Chair Cushion Set" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Starting Price ($)</label>
                      <input type="number" step="0.01" min="0" className="form-control" value={lpPrice} onChange={e => setLpPrice(e.target.value)} required placeholder="49.99" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Link URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(internal or external)</span></label>
                    <LinkedUrlInput value={lpLink} onChange={setLpLink} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Product Image {lpEditingId && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(leave blank to keep current)</span>}</label>
                    <input type="file" className="form-control" accept="image/*" onChange={e => setLpFile(e.target.files?.[0] || null)} {...(!lpEditingId && { required: true })} style={{ background: 'var(--gray-50)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Short Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(shown on card)</span></label>
                    <textarea className="form-control" value={lpDesc} onChange={e => setLpDesc(e.target.value)} rows={2} required placeholder="Brief description..." />
                  </div>

                  <CollapsibleSection title="📝 Rich Description (Detail Page)" open={lpShowRich} onToggle={() => setLpShowRich(s => !s)}
                    hint="Build a rich content page with headings, paragraphs, bullets and spacing. Select text then B / I / U for inline formatting.">
                    <RichDescriptionEditor blocks={lpRichBlocks} setBlocks={setLpRichBlocks} />
                  </CollapsibleSection>

                  <CollapsibleSection title="❓ FAQ Section" open={lpShowFaq} onToggle={() => setLpShowFaq(s => !s)}
                    hint="FAQ items appear on the linked product detail page.">
                    <FaqEditor faqs={lpFaqs} setFaqs={setLpFaqs} />
                  </CollapsibleSection>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={lpSubmitting}>
                      {lpSubmitting ? 'Saving...' : (lpEditingId ? 'Update' : 'Add Linked Product')}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={handleLpCancel}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid-4" style={{ gap: '1.5rem' }}>
              {linkedProducts.map(lp => (
                <div key={lp.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {lp.imageUrl
                    ? <div style={{ height: '180px', overflow: 'hidden' }}><img src={lp.imageUrl} alt={lp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    : <div style={{ height: '180px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🔗</div>}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lp.name}>{lp.name}</h3>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, width: 'fit-content' }}>🔗 Linked</span>
                    <div style={{ color: 'var(--brand-secondary)', fontWeight: 700 }}>From ${lp.startingPrice?.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>→ {lp.link}</div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1, margin: '0.25rem 0' }}>{lp.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {lp.richDescription && <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>✓ Rich</span>}
                      {(() => { try { return JSON.parse(lp.faqData || '[]').length > 0 ? <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>✓ FAQ</span> : null; } catch { return null; } })()}
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                      <button onClick={() => handleLpEdit(lp)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)' }}>Edit</button>
                      <button onClick={() => handleLpDelete(lp.id)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {dataLoading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', border: '2px dashed var(--gray-200)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 600 }}>Loading linked products...</div>
                </div>
              ) : linkedProducts.length === 0 && !showLinkedForm ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', border: '2px dashed var(--gray-200)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No linked products yet</div>
                  <div style={{ fontSize: '0.9rem' }}>Click "Add Linked Product" to get started.</div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
