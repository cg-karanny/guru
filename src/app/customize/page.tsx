import type { Metadata } from 'next';
import { Suspense } from 'react';
import CustomizePage from './CustomizePage';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Customize Your Cushion',
  description: 'Build your perfect custom cushion with our step-by-step configurator. Choose size, shape, fabric and more.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await prisma.media.findMany();
  const initialStepImages: Record<string, string> = {};
  items.forEach(item => {
    const key = item.key.replace(/^(shape|fill|zipper|piping|ties)_/, '').toLowerCase();
    initialStepImages[key] = item.url;
  });

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <CustomizePage initialStepImages={initialStepImages} />
    </Suspense>
  );
}
