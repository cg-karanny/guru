'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import SwalAlert from '@/components/SwalAlert/SwalAlert';
import styles from '../admin.module.css';
import pageStyles from './page.module.css';
import { pageContentDefaults, storefrontPageSeoDefaults } from '@/lib/pageContentDefaults';
import AboutPageEditor from './editors/AboutPageEditor';
import HowToMeasurePageEditor from './editors/HowToMeasurePageEditor';
import TermsPageEditor from './editors/TermsPageEditor';
import FAQPageEditor from './editors/FAQPageEditor';
import PrivacyPolicyPageEditor from './editors/PrivacyPolicyPageEditor';
import SEOOnlyPageEditor from './editors/SEOOnlyPageEditor';
import type { PageContentValue } from './editors/PageFieldsEditor';

type Value = PageContentValue;
const pageDefaults = { ...pageContentDefaults, ...storefrontPageSeoDefaults };
type PageKey = keyof typeof pageDefaults;
const pages: { key: PageKey; label: string; path: string; group: 'Content pages' | 'Public storefront' }[] = [
  { key: 'about', label: 'About', path: '/about', group: 'Content pages' },
  { key: 'how-to-measure', label: 'How to Measure', path: '/how-to-measure', group: 'Content pages' },
  { key: 'terms', label: 'Terms & Conditions', path: '/terms', group: 'Content pages' },
  { key: 'faq', label: 'FAQ', path: '/faq', group: 'Content pages' },
  { key: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy', group: 'Content pages' },
  { key: 'store-home', label: 'Home', path: '/', group: 'Public storefront' },
  { key: 'store-shop-indoor', label: 'Shop · Indoor', path: '/shop/indoor', group: 'Public storefront' },
  { key: 'store-shop-outdoor', label: 'Shop · Outdoor', path: '/shop/outdoor', group: 'Public storefront' },
  { key: 'store-shop-boat', label: 'Shop · Boat', path: '/shop/boat', group: 'Public storefront' },
  { key: 'store-shop-rv', label: 'Shop · RV', path: '/shop/rv', group: 'Public storefront' },
  { key: 'store-shop-pet-bed', label: 'Shop · Pet Beds', path: '/shop/pet-bed', group: 'Public storefront' },
  { key: 'store-sunbrella-fabric', label: 'Sunbrella Fabric', path: '/sunbrella-fabric', group: 'Public storefront' },
  { key: 'store-cleaning', label: 'Cleaning Guide', path: '/cleaning', group: 'Public storefront' },
  { key: 'store-contact', label: 'Contact', path: '/contact', group: 'Public storefront' },
  { key: 'store-blogs', label: 'Blogs', path: '/blogs', group: 'Public storefront' },
  { key: 'store-customize', label: 'Customize', path: '/customize', group: 'Public storefront' },
];

function mergeDefaults(base: Value, saved: Value): Value {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
  if (base && typeof base === 'object') {
    const result: Record<string, Value> = { ...base };
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const [key, value] of Object.entries(saved)) result[key] = key in result ? mergeDefaults(result[key], value) : value;
    }
    return result;
  }
  return typeof saved === 'string' ? saved : base;
}

export default function AdminPagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<PageKey | null>(null);
  const [content, setContent] = useState<Record<PageKey, Value>>(() => pageDefaults as unknown as Record<PageKey, Value>);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savedPages, setSavedPages] = useState<Set<PageKey>>(new Set());
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.replace('/account');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    fetch('/api/admin/page-content').then(async response => {
      if (!response.ok) throw new Error('Could not load saved page content.');
      const saved = await response.json();
      setSavedPages(new Set(pages.filter(page => typeof saved[page.key] === 'string').map(page => page.key)));
      const next = { ...pageDefaults } as unknown as Record<PageKey, Value>;
      for (const page of pages) {
        if (typeof saved[page.key] === 'string') {
          try { next[page.key] = mergeDefaults(next[page.key], JSON.parse(saved[page.key])); } catch { /* Keep the original content if a saved value is malformed. */ }
        }
      }
      setContent(next);
    }).catch(error => setMessage(error.message)).finally(() => setBusy(false));
  }, [user]);

  const active = pages.find(page => page.key === selected);
  const PageEditor = selected ? ({
    about: AboutPageEditor,
    'how-to-measure': HowToMeasurePageEditor,
    terms: TermsPageEditor,
    faq: FAQPageEditor,
    'privacy-policy': PrivacyPolicyPageEditor,
  } as Partial<Record<keyof typeof pageContentDefaults, typeof AboutPageEditor>>)[selected as keyof typeof pageContentDefaults] ?? SEOOnlyPageEditor : null;
  const save = async () => {
    if (!selected) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/admin/page-content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: selected, content: content[selected] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save page content.');
      setSavedPages(current => new Set(current).add(selected));
      setMessage('');
      setAlert({ type: 'success', title: 'Saved successfully', message: active?.group === 'Public storefront' ? `${active.label} SEO settings have been updated.` : `${active?.label ?? 'Page'} content and SEO settings have been updated.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not save page content.';
      setMessage(errorMessage);
      setAlert({ type: 'error', title: 'Save failed', message: errorMessage });
    }
    finally { setSaving(false); }
  };

  const removeSavedContent = async (page: typeof pages[number]) => {
    if (!confirm(`Delete saved edits for â€œ${page.label}â€? The page will return to its original content.`)) return;
    setMessage('');
    try {
      const response = await fetch(`/api/admin/page-content?page=${encodeURIComponent(page.key)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not delete saved content.');
      setSavedPages(current => { const next = new Set(current); next.delete(page.key); return next; });
      setContent(current => ({ ...current, [page.key]: pageDefaults[page.key] as unknown as Value }));
      setMessage('');
      setAlert({ type: 'success', title: 'Saved edits deleted', message: `${page.label} has been restored to its original content.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not delete saved content.';
      setMessage(errorMessage);
      setAlert({ type: 'error', title: 'Delete failed', message: errorMessage });
    }
  };

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;
  return <div className={styles.layout}>
    <SwalAlert open={!!alert} type={alert?.type} title={alert?.title ?? ''} message={alert?.message ?? ''} onClose={() => setAlert(null)} />
    <AdminSidebar />
    <main className={styles.main}>
      <div className={styles.mainHeader}><div><h1>Page Content</h1><p style={{ color: 'var(--text-muted)', marginTop: '.35rem' }}>Edit page content or manage SEO settings for public storefront pages.</p></div></div>
      <div className={`card ${pageStyles.contentCard}`}>
        {selected && active ? <>
          <div className={pageStyles.editorHeader}>
            <div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSelected(null); setMessage(''); }}>← All pages</button>
              <h2 className={pageStyles.editorTitle}>{active.label}</h2>
              {active.group === 'Public storefront' && <p style={{ color: 'var(--text-muted)', margin: '.25rem 0', fontSize: '.88rem' }}>SEO settings only. Page copy is managed in its storefront components.</p>}
              <a href={active.path} target="_blank" rel="noreferrer" style={{ fontSize: '.85rem' }}>View live page</a>
            </div>
            <button type="button" className="btn btn-primary" disabled={busy || saving} onClick={save}>{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
          {busy ? <p>Loading saved content...</p> : PageEditor && <PageEditor value={content[selected]} onChange={next => setContent({ ...content, [selected]: next })} />}
        </> : <>
          <h2 className={pageStyles.listTitle}>Pages</h2>
          {busy ? <p>Loading pages...</p> : <>
            {(['Content pages', 'Public storefront'] as const).map(group => <section key={group}>
              <h3 className={pageStyles.listTitle}>{group}</h3>
              <div className={pageStyles.pageList}>
              {pages.filter(page => page.group === group).map(page => <div key={page.key} className={pageStyles.pageRow}>
              <div><strong>{page.label}</strong><div className={pageStyles.pagePath}>{page.path} · {savedPages.has(page.key) ? 'Edited' : 'Using original content'}</div></div>
              <div className={pageStyles.pageActions}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSelected(page.key); setMessage(''); }}>Edit</button>
                {page.group === 'Content pages' && <button type="button" className={`btn btn-outline btn-sm ${pageStyles.deleteButton}`} disabled={!savedPages.has(page.key)} onClick={() => removeSavedContent(page)}>Delete</button>}
              </div>
              </div>)}
              </div>
            </section>)}
          </>}
        </>}
        {message && <p role="status" className={`${pageStyles.statusMessage} ${message.includes('saved') || message.includes('restored') ? pageStyles.successMessage : pageStyles.errorMessage}`}>{message}</p>}
      </div>
    </main>
  </div>;
}

