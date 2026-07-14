import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;
    const type = formData.get('type') as string | null;

    if (!file || !key) {
      return NextResponse.json({ error: 'Missing file or key' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'tmp';
    const filename = `media/${key.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${ext}`;

    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (ext === 'webm') mimeType = 'video/webm';
      else if (ext === 'mp4') mimeType = 'video/mp4';
      else if (ext === 'avi') mimeType = 'video/x-msvideo';
      else if (ext === 'mov') mimeType = 'video/quicktime';
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'gif') mimeType = 'image/gif';
      else mimeType = 'application/octet-stream';
    }

    const fileUrl = await uploadToS3(buffer, filename, mimeType);

    const existingMedia = await prisma.media.findUnique({ where: { key } });
    if (existingMedia?.url && existingMedia.url.includes('amazonaws.com')) {
      await deleteFromS3(existingMedia.url);
    }

    // Update DB
    const media = await prisma.media.upsert({
      where: { key },
      update: { url: fileUrl, fileType: type || 'image' },
      create: { key, url: fileUrl, fileType: type || 'image' }
    });

    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
