import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

type ProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return {};

  const title = product.metaTitle?.trim() || `${product.name} | Cushion Guru`;
  const description = product.metaDescription?.trim() || product.description;
  const imageAlt = product.imageAlt?.trim() || product.name;

  return {
    title,
    description,
    keywords: product.seoTags?.split(',').map(tag => tag.trim()).filter(Boolean),
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: imageAlt }] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
