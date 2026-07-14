import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Public: anyone can GET settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    if (!map.logoUrl && map.siteLogo) {
      map.logoUrl = map.siteLogo;
    }
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin only: upsert text settings as JSON body
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      // Logo upload
      const formData = await req.formData();
      const file = formData.get('logo') as File | null;
      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'png';
      const filename = `settings/logo_${Date.now()}.${ext}`;

      const logoUrl = await uploadToS3(buffer, filename, file.type || 'image/png');

      const existingLogo = await prisma.setting.findUnique({ where: { key: 'logoUrl' } });
      if (existingLogo?.value && existingLogo.value.includes('amazonaws.com')) {
        await deleteFromS3(existingLogo.value);
      }

      await prisma.setting.upsert({
        where: { key: 'logoUrl' },
        update: { value: logoUrl },
        create: { key: 'logoUrl', value: logoUrl },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json({ logoUrl });
    } else {
      // JSON settings update (siteName, etc.)
      const body = await req.json();
      if (body.logoUrl === '') {
        await prisma.setting.upsert({
          where: { key: 'logoUrl' },
          update: { value: '' },
          create: { key: 'logoUrl', value: '' },
        });
        revalidatePath('/', 'layout');
        return NextResponse.json({ updated: 1 });
      }
      
      const updates = await Promise.all(
        Object.entries(body).map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          })
        )
      );
      revalidatePath('/', 'layout');
      return NextResponse.json({ updated: updates.length });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
