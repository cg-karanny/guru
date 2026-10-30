'use client';

import { useEffect, useState } from 'react';
import pageStyles from '../page.module.css';
import RichTextField from './RichTextField';

export type PageContentValue = string | PageContentValue[] | { [key: string]: PageContentValue };

function labelFor(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
}

function TagsInput({ value, onChange }: { value: PageContentValue[]; onChange: (value: PageContentValue[]) => void }) {
  const formatTags = (tags: PageContentValue[]) => tags.filter((tag): tag is string => typeof tag === 'string').join(', ');
  const [draft, setDraft] = useState(() => formatTags(value));

  useEffect(() => {
    setDraft(formatTags(value));
  }, [value]);

  return <input
    className={`form-control ${pageStyles.input}`}
    value={draft}
    placeholder="Example: custom cushions, outdoor seating, Sunbrella"
    onChange={event => setDraft(event.target.value)}
    onBlur={() => onChange(draft.split(',').map(tag => tag.trim()).filter(Boolean))}
    aria-label="Comma-separated SEO tags"
  />;
}

function FieldEditor({ value, onChange, depth = 0, path = '', richText = false, disableAddItems = false }: {
  value: PageContentValue;
  onChange: (value: PageContentValue) => void;
  depth?: number;
  path?: string;
  richText?: boolean;
  disableAddItems?: boolean;
}) {
  if (typeof value === 'string') {
    const richTextField = path === 'introduction' || path.endsWith('.text') || path.endsWith('.a') || path.endsWith('.ctaText') || path.includes('.steps.') || value.length > 90;
    if (richText && richTextField && !path.startsWith('seo.')) {
      return <RichTextField value={value} onChange={onChange} />;
    }
    const multiline = value.length > 90;
    return multiline
      ? <textarea className={`form-control ${pageStyles.textarea}`} rows={5} value={value} onChange={event => onChange(event.target.value)} />
      : <input className={`form-control ${pageStyles.input}`} value={value} onChange={event => onChange(event.target.value)} />;
  }

  if (Array.isArray(value)) {
    return <div className={pageStyles.itemList}>
      {value.map((item, index) => (
        <div key={index} className={pageStyles.itemCard}>
          <div className={pageStyles.itemHeader}>
            <strong>{typeof item === 'object' && !Array.isArray(item) ? String(item.title ?? item.name ?? item.q ?? `Item ${index + 1}`) : `Item ${index + 1}`}</strong>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>Remove item</button>
          </div>
          <FieldEditor value={item} depth={depth + 1} path={`${path}.${index}`} richText={richText} disableAddItems={disableAddItems} onChange={next => onChange(value.map((entry, itemIndex) => itemIndex === index ? next : entry))} />
        </div>
      ))}
      {!disableAddItems && <button type="button" className="btn btn-outline btn-sm" style={{ justifySelf: 'start' }} onClick={() => {
        const sample = value[value.length - 1];
        const blank = typeof sample === 'object' && sample !== null && !Array.isArray(sample)
          ? Object.fromEntries(Object.keys(sample).map(key => [key, '']))
          : '';
        onChange([...value, blank as PageContentValue]);
      }}>+ Add item</button>}
    </div>;
  }

  const entries = Object.entries(value);
  if (depth === 0) {
    entries.sort(([left], [right]) => left === 'seo' ? 1 : right === 'seo' ? -1 : 0);
  }

  return <div className={depth === 0 ? pageStyles.fieldGrid : pageStyles.nestedFields}>
    {entries.filter(([key]) => !(path === 'seo' && (key === 'category' || key === 'imageAlts'))).map(([key, child]) => path === 'seo' && key === 'tags' && Array.isArray(child)
      ? <div key={key} className={pageStyles.field}>
          <span className={pageStyles.fieldLabel}>{labelFor(key)}</span>
          <TagsInput value={child} onChange={next => onChange({ ...value, [key]: next })} />
        </div>
      : key === 'seo' && depth === 0
      ? <section key={key} className={pageStyles.seoSection}>
          <h3>Search engine optimization</h3>
          <p>Manage this page’s browser title, search description, and tags.</p>
          <FieldEditor value={child} depth={depth + 1} path={key} richText={richText} disableAddItems={disableAddItems} onChange={next => onChange({ ...value, [key]: next })} />
        </section>
      : <div key={key} className={pageStyles.field}>
          <span className={pageStyles.fieldLabel}>{labelFor(key)}</span>
          <FieldEditor value={child} depth={depth + 1} path={path ? `${path}.${key}` : key} richText={richText} disableAddItems={disableAddItems} onChange={next => onChange({ ...value, [key]: next })} />
        </div>)}
  </div>;
}

export default function PageFieldsEditor({ value, onChange, richText = false, disableAddItems = false }: { value: PageContentValue; onChange: (value: PageContentValue) => void; richText?: boolean; disableAddItems?: boolean }) {
  return <FieldEditor value={value} onChange={onChange} richText={richText} disableAddItems={disableAddItems} />;
}
