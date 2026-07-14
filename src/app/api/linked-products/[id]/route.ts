import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.linkedProduct.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const link = formData.get('link') as string;
    const startingPriceStr = formData.get('startingPrice') as string;
    const description = formData.get('description') as string;
    const richDescription = formData.get('richDescription') as string | null;
    const faqData = formData.get('faqData') as string | null;
    const file = formData.get('image') as File | null;

    if (!name || !link || !description || !startingPriceStr) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const startingPrice = parseFloat(startingPriceStr);
    let updateData: any = {
      name, link, startingPrice, description,
      richDescription: richDescription || null,
      faqData: faqData || null,
    };

    const existing = await prisma.linkedProduct.findUnique({ where: { id } });
    if (file && file.size > 0) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `linked/linked_${slug}_${Date.now()}.${ext}`;
      updateData.imageUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');
      if (existing?.imageUrl?.includes('amazonaws.com')) await deleteFromS3(existing.imageUrl);
    }

    const updated = await prisma.linkedProduct.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const existing = await prisma.linkedProduct.findUnique({ where: { id } });
    if (existing?.imageUrl?.includes('amazonaws.com')) await deleteFromS3(existing.imageUrl);
    await prisma.linkedProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
