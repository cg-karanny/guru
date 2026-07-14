import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
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

    const resolvedParams = await params;
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const description = formData.get('description') as string;
    const richDescription = formData.get('richDescription') as string | null;
    const faqData = formData.get('faqData') as string | null;
    const lpStr = formData.get('listingPrice') as string;
    const spStr = formData.get('sellingPrice') as string;
    const stockStr = formData.get('stock') as string;
    const file = formData.get('image') as File | null;

    if (!name || !sku || !description || !lpStr || !spStr) {
      return NextResponse.json({ error: 'Name, SKU, Description, and Prices are required' }, { status: 400 });
    }

    const listingPrice = parseFloat(lpStr);
    const sellingPrice = parseFloat(spStr);
    const stock = stockStr ? parseInt(stockStr, 10) : 0;

    let updateData: any = {
      name, sku, description,
      richDescription: richDescription || null,
      faqData: faqData || null,
      listingPrice, sellingPrice, stock,
    };

    const existingProduct = await prisma.product.findUnique({ where: { id: resolvedParams.id } });

    if (file && file.size > 0) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `products/prod_${slug}_${Date.now()}.${ext}`;
      const newUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');
      updateData.imageUrl = newUrl;

      // We intentionally DO NOT delete the old image from S3 here to ensure that 
      // old order histories that rely on the previous image URL continue to work.
    }

    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Used to decrement stock when an order is placed
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { decrementBy } = await req.json();
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newStock = Math.max(0, product.stock - (decrementBy || 1));
    const updated = await prisma.product.update({ where: { id }, data: { stock: newStock } });
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

    const resolvedParams = await params;
    const existingProduct = await prisma.product.findUnique({ where: { id: resolvedParams.id } });
    
    // We intentionally DO NOT delete from S3 here to ensure that order histories 
    // that rely on this product's image URL continue to display the image properly.

    await prisma.product.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
