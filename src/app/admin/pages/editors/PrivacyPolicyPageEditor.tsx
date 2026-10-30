'use client';
import { useEffect } from 'react';
import PageFieldsEditor, { type PageContentValue } from './PageFieldsEditor';

function asRecord(value: PageContentValue): Record<string, PageContentValue> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function preparePolicyContent(value: PageContentValue): PageContentValue {
  const root = asRecord(value);
  if (!root || !Array.isArray(root.sections)) return value;

  return {
    ...root,
    sections: root.sections.map(section => {
      const sectionRecord = asRecord(section);
      if (!sectionRecord || !Array.isArray(sectionRecord.items)) return section;

      const paragraphs = sectionRecord.items.map(entry => {
        const item = asRecord(entry);
        if (!item) return '';
        const label = typeof item.label === 'string' ? `<strong>${escapeHtml(item.label)}:</strong> ` : '';
        const text = typeof item.text === 'string' ? item.text : '';
        return `<p>${label}${text}</p>`;
      }).filter(Boolean).join('');
      const existingText = typeof sectionRecord.text === 'string' ? sectionRecord.text : '';
      const { items: _items, ...rest } = sectionRecord;
      return { ...rest, text: existingText + paragraphs };
    }),
  };
}

export default function PrivacyPolicyPageEditor({ value, onChange }: { value: PageContentValue; onChange: (value: PageContentValue) => void }) {
  const prepared = preparePolicyContent(value);
  useEffect(() => {
    if (JSON.stringify(prepared) !== JSON.stringify(value)) onChange(prepared);
  }, [prepared, value, onChange]);
  return <PageFieldsEditor value={prepared} onChange={next => onChange(preparePolicyContent(next))} richText />;
}
