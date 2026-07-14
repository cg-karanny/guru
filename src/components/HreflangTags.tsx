'use client';

import { usePathname } from 'next/navigation';

export default function HreflangTags() {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : 'https://cushionguru.com';

  const baseUrl = `${siteUrl}${pathname === '/' ? '' : pathname}`;

  // Requested languages (excluding English, which is the root)
  const langs = ['zh', 'pl', 'es', 'sv', 'ja', 'pt', 'fr', 'tr', 'nl', 'it', 'de', 'ru'];

  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />
      <link rel="alternate" hrefLang="en" href={baseUrl} />
      <link rel="alternate" hrefLang="en-US" href={baseUrl} />

      {langs.map(lang => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={baseUrl}
        />
      ))}
    </>
  );
}
