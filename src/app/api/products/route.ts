import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3 } from '@/lib/s3';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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
    const sku = formData.get('sku') as string;
    const description = formData.get('description') as string;
    const richDescription = formData.get('richDescription') as string | null;
    const faqData = formData.get('faqData') as string | null;
    const listingPriceStr = formData.get('listingPrice') as string;
    const sellingPriceStr = formData.get('sellingPrice') as string;
    const stockStr = formData.get('stock') as string;
    const file = formData.get('image') as File | null;

    if (!name || !sku || !description || !listingPriceStr || !sellingPriceStr || !file || file.size === 0) {
      return NextResponse.json({ error: 'All fields including image are required' }, { status: 400 });
    }

    const listingPrice = parseFloat(listingPriceStr);
    const sellingPrice = parseFloat(sellingPriceStr);
    const stock = stockStr ? parseInt(stockStr, 10) : 0;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `products/prod_${slug}_${Date.now()}.${ext}`;
    const imageUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        richDescription: richDescription || null,
        faqData: faqData || null,
        listingPrice,
        sellingPrice,
        imageUrl,
        stock,
      }
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
