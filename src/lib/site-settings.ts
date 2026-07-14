import { prisma } from '@/lib/prisma';

export async function getSiteBrandSettings() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['siteName', 'siteLogo', 'logoUrl'] } }
  });

  const siteName = settings.find(s => s.key === 'siteName')?.value || 'Cushion Guru';
  const siteLogo = settings.find(s => s.key === 'logoUrl')?.value
    || settings.find(s => s.key === 'siteLogo')?.value || '';

  return { siteName, siteLogo };
}
