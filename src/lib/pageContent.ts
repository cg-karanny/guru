import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const PAGE_CONTENT_KEYS = [
  'about', 'how-to-measure', 'terms', 'faq', 'privacy-policy',
  'store-home', 'store-shop-indoor', 'store-shop-outdoor', 'store-shop-boat', 'store-shop-rv',
  'store-shop-pet-bed', 'store-sunbrella-fabric', 'store-cleaning', 'store-contact', 'store-blogs', 'store-customize',
] as const;
export type ManagedPage = (typeof PAGE_CONTENT_KEYS)[number];

export const PAGE_PATHS: Record<ManagedPage, string> = {
  about: '/about', 'how-to-measure': '/how-to-measure', terms: '/terms', faq: '/faq', 'privacy-policy': '/privacy-policy',
  'store-home': '/', 'store-shop-indoor': '/shop/indoor', 'store-shop-outdoor': '/shop/outdoor',
  'store-shop-boat': '/shop/boat', 'store-shop-rv': '/shop/rv', 'store-shop-pet-bed': '/shop/pet-bed',
  'store-sunbrella-fabric': '/sunbrella-fabric', 'store-cleaning': '/cleaning', 'store-contact': '/contact', 'store-blogs': '/blogs', 'store-customize': '/customize',
};

export async function getManagedPageContent<T>(page: ManagedPage, fallback: T): Promise<T> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: `pageContent:${page}` } });
    if (!setting) return fallback;
    const parsed: unknown = JSON.parse(setting.value);
    return parsed && typeof parsed === 'object' ? { ...fallback as object, ...parsed as object } as T : fallback;
  } catch (error) {
    console.error(`Could not read managed page content for ${page}`, error);
    return fallback;
  }
}

export async function getManagedSeo(page: ManagedPage, fallback: Metadata): Promise<Metadata> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: `pageContent:${page}` } });
    if (!setting) return fallback;
    const parsed = JSON.parse(setting.value) as { seo?: { metaTitle?: string; metaDescription?: string; tags?: string[] } };
    const seo = parsed?.seo;
    if (!seo) return fallback;
    const title = seo.metaTitle || fallback.title;
    const description = seo.metaDescription || fallback.description;
    return {
      ...fallback,
      title: title as Metadata['title'],
      ...(description ? { description: String(description) } : {}),
      ...(seo.tags ? { keywords: seo.tags } : {}),
      openGraph: fallback.openGraph ? { ...fallback.openGraph, title: String(title), ...(description ? { description: String(description) } : {}) } : undefined,
      twitter: fallback.twitter ? { ...fallback.twitter, title: String(title), ...(description ? { description: String(description) } : {}) } : undefined,
    };
  } catch (error) {
    console.error(`Could not read managed SEO for ${page}`, error);
    return fallback;
  }
}
