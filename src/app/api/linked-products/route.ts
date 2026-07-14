import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3 } from '@/lib/s3';

export async function GET() {
  try {
    const products = await prisma.linkedProduct.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const link = formData.get('link') as string;
    const startingPriceStr = formData.get('startingPrice') as string;
    const description = formData.get('description') as string;
    const richDescription = formData.get('richDescription') as string | null;
    const faqData = formData.get('faqData') as string | null;
    const file = formData.get('image') as File | null;

    if (!name || !link || !description || !startingPriceStr || !file || file.size === 0) {
      return NextResponse.json({ error: 'All fields including image are required' }, { status: 400 });
    }

    const startingPrice = parseFloat(startingPriceStr);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `linked/linked_${slug}_${Date.now()}.${ext}`;
    const imageUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');

    const product = await prisma.linkedProduct.create({
      data: {
        name, link, imageUrl, startingPrice, description,
        richDescription: richDescription || null,
        faqData: faqData || null,
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Linked product creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
