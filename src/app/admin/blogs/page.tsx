'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';



/* ── Rich Text Toolbar ── */
const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);

  const COLORS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#1a3c5e', '#FBB91E', '#475569', '#9ca3af'];

  // Load initial value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // only on mount

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLine = () => {
    exec('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:1rem 0;" /><br />');
  };

  const btnStyle: React.CSSProperties = {
    padding: '4px 9px', border: '1px solid #d1d5db', borderRadius: '5px',
    background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    color: '#374151', display: 'flex', alignItems: 'center', gap: '3px',
    transition: 'background 0.15s',
  };

  const ColorPicker = ({ label, cmd, open, setOpen }: { label: string; cmd: string; open: boolean; setOpen: (v: boolean) => void }) => (
    <div style={{ position: 'relative' }}>
      <button type="button" style={btnStyle} onClick={() => { setOpen(!open); setFontSizeOpen(false); }} title={label}>{label}</button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: '140px' }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => { exec(cmd, c); setOpen(false); }}
              style={{ width: '26px', height: '26px', borderRadius: '4px', background: c, border: c === '#ffffff' ? '1px solid #d1d5db' : 'none', cursor: 'pointer' }} title={c} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'visible' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 10px', borderBottom: '1px solid var(--gray-200)', background: '#f9fafb', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', position: 'sticky', top: 0, zIndex: 10 }} onClick={e => e.stopPropagation()}>
        <button type="button" style={btnStyle} onClick={() => exec('bold')} title="Bold"><strong>B</strong></button>
        <button type="button" style={{ ...btnStyle, fontStyle: 'italic' }} onClick={() => exec('italic')} title="Italic"><em>I</em></button>
        <button type="button" style={{ ...btnStyle, textDecoration: 'underline' }} onClick={() => exec('underline')} title="Underline"><u>U</u></button>
        <button type="button" style={{ ...btnStyle, textDecoration: 'line-through' }} onClick={() => exec('strikeThrough')} title="Strikethrough">S̶</button>
        <div style={{ width: 1, background: '#d1d5db', margin: '0 2px' }} />
        <button type="button" style={btnStyle} onClick={() => exec('justifyLeft')} title="Align Left">⬅</button>
        <button type="button" style={btnStyle} onClick={() => exec('justifyCenter')} title="Center">⬛</button>
        <button type="button" style={btnStyle} onClick={() => exec('justifyRight')} title="Align Right">➡</button>
        <div style={{ width: 1, background: '#d1d5db', margin: '0 2px' }} />
        <button type="button" style={btnStyle} onClick={() => exec('insertUnorderedList')} title="Bullet List">• List</button>
        <button type="button" style={btnStyle} onClick={() => exec('insertOrderedList')} title="Numbered List">1. List</button>
        <button type="button" style={btnStyle} onClick={insertLine} title="Insert Horizontal Line">— Line</button>
        <button type="button" style={btnStyle} onClick={() => {
          const url = prompt('Enter link URL (e.g., https://example.com):');
          if (url) exec('createLink', url);
        }} title="Insert Link">🔗 Link</button>
        <div style={{ width: 1, background: '#d1d5db', margin: '0 2px' }} />
        {/* Font Size */}
        <div style={{ position: 'relative' }}>
          <button type="button" style={btnStyle} onClick={() => { setFontSizeOpen(!fontSizeOpen); setTextColorOpen(false); setBgColorOpen(false); }} title="Font Size">Aa ▾</button>
          {fontSizeOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '90px' }}>
              {FONT_SIZES.map(sz => (
                <button key={sz} type="button" onClick={() => { exec('fontSize', '7'); const els = editorRef.current?.querySelectorAll('font[size="7"]'); els?.forEach(el => { (el as HTMLElement).removeAttribute('size'); (el as HTMLElement).style.fontSize = sz; }); setFontSizeOpen(false); onChange(editorRef.current?.innerHTML || ''); }}
                  style={{ display: 'block', width: '100%', padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: sz }}>
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>
        <ColorPicker label="A▾" cmd="foreColor" open={textColorOpen} setOpen={v => { setTextColorOpen(v); if (v) setBgColorOpen(false); setFontSizeOpen(false); }} />
        <ColorPicker label="H▾" cmd="hiliteColor" open={bgColorOpen} setOpen={v => { setBgColorOpen(v); if (v) setTextColorOpen(false); setFontSizeOpen(false); }} />
        <div style={{ width: 1, background: '#d1d5db', margin: '0 2px' }} />
        <button type="button" style={btnStyle} onClick={() => exec('undo')} title="Undo">↺</button>
        <button type="button" style={btnStyle} onClick={() => exec('redo')} title="Redo">↻</button>
        <button type="button" style={btnStyle} onClick={() => exec('removeFormat')} title="Clear Formatting">✕ Fmt</button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{
          minHeight: '200px',
          padding: '1rem',
          outline: 'none',
          fontSize: '0.95rem',
          lineHeight: 1.8,
          color: 'var(--text-primary)',
          background: '#fff',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          wordBreak: 'break-word',
        }}
      />
    </div>
  );
}

export default function AdminBlogsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    } else if (user?.role === 'ADMIN') {
      fetchBlogs();
    }
  }, [user, loading, router]);

  const fetchBlogs = () => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => { setBlogs(data); setDataLoading(false); })
      .catch(err => { console.error(err); setDataLoading(false); });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || (!file && !editingId)) {
      alert('Please provide title, description, and an image (if creating)');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    if (file) {
      formData.append('image', file);
    }

    try {
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (res.ok) {
        alert(`Blog post ${editingId ? 'updated' : 'created'}!`);
        resetForm();
        fetchBlogs();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'Failed to save blog'}`);
      }
    } catch (err) {
      alert('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setFile(null);
    setEditingId(null);
    setEditorKey(k => k + 1);
    const fileInput = document.getElementById('blogImageInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setDescription(blog.excerpt);
    setContent(blog.content || blog.excerpt);
    setFile(null);
    setEditorKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlogs();
      } else {
        alert('Failed to delete blog post');
      }
    } catch (err) {
      alert('Failed to delete blog post');
    }
  };

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Manage Blogs</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)', fontSize: '1.5rem' }}>{editingId ? 'Edit Blog Post' : 'Add New Blog Post'}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Title</label>
              <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Description (Excerpt)</label>
              <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Content (Full Text)</label>
              <RichTextEditor key={editorKey} value={content} onChange={setContent} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Rich text: bold, italic, underline, color, highlight, font size, lists, lines. Paste formatted text to preserve styling.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Thumbnail Image {editingId && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Leave blank to keep current)</span>}</label>
              <input type="file" id="blogImageInput" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} {...(!editingId && { required: true })} style={{ background: 'var(--gray-50)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Blog' : 'Create Blog')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>Existing Blogs</h2>
        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {blogs.map(blog => (
            <div key={blog.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {blog.imageUrl ? (
                <div style={{ height: '180px', overflow: 'hidden', background: 'var(--gray-100)' }}>
                  <img src={blog.imageUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ height: '180px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>
              )}

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={blog.title}>{blog.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem', flex: 1 }} title={blog.excerpt}>{blog.excerpt}</p>
                {blog.content && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', maxHeight: '60px', overflow: 'hidden', position: 'relative' }}>
                    <strong>Preview:</strong> <span dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                  <button onClick={() => handleEdit(blog)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {dataLoading ? (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No blog posts found.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
