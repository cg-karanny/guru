'use client';
import PageFieldsEditor, { type PageContentValue } from './PageFieldsEditor';
export default function FAQPageEditor({ value, onChange }: { value: PageContentValue; onChange: (value: PageContentValue) => void }) {
  return <PageFieldsEditor value={value} onChange={onChange} richText />;
}
