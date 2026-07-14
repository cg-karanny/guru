import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3 } from '@/lib/s3';

// ── GET /api/fabrics ─────────────────────────────────────
// Returns all brands with their fabric items
export async function GET() {
  try {
    const brands = await prisma.fabricBrand.findMany({
      where: {
        fabrics: {
          some: {}
        }
      },
      include: { fabrics: { orderBy: { label: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST /api/fabrics ────────────────────────────────────
// Admin only. FormData fields:
//   brandName  – string
//   csv        – CSV file with columns: id, label, price
//   images     – one or more image files (filename = id.ext)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const brandName = (formData.get('brandName') as string | null)?.trim();
    const csvFile = formData.get('csv') as File | null;
    const imageFiles = formData.getAll('images') as File[];

    if (!brandName || !csvFile || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'brandName, csv and at least one image are required' },
        { status: 400 }
      );
    }

    // ── Parse CSV ──────────────────────────────────────
    const csvText = await csvFile.text();
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    // Expect header: id,label,price
    const header = lines[0].toLowerCase().split(',');
    const idIdx    = header.indexOf('id');
    const labelIdx = header.indexOf('label');
    const priceIdx = header.indexOf('price');

    if (idIdx === -1 || labelIdx === -1 || priceIdx === -1) {
      return NextResponse.json(
        { error: 'CSV must have columns: id, label, price' },
        { status: 400 }
      );
    }

    type CsvRow = { id: string; label: string; price: number };
    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const id    = cols[idIdx]?.trim();
      const label = cols[labelIdx]?.trim();
      const priceRaw = cols[priceIdx]?.trim().replace('$', '');
      const price = parseFloat(priceRaw);
      if (id && label && !isNaN(price)) rows.push({ id, label, price });
    }

    const imageMap: Record<string, string> = {};
    for (const file of imageFiles) {
      const baseName = file.name.replace(/\.[^.]+$/, ''); // strip extension
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `fabrics/fabric_${baseName}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const s3Url = await uploadToS3(buffer, filename, file.type || 'image/jpeg');
      imageMap[baseName] = s3Url;
    }

    // ── Upsert brand + items ───────────────────────────
    const brand = await prisma.fabricBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });

    // Insert fabric items (skip rows with no matching image)
    const created: string[] = [];
    for (const row of rows) {
      const imageUrl = imageMap[row.id];
      if (!imageUrl) continue; // no image uploaded for this id

      // Check if already exists (fabricId unique within brand)
      const existing = await prisma.fabricItem.findFirst({
        where: { fabricId: row.id, brandId: brand.id },
      });

      if (existing) {
        await prisma.fabricItem.update({
          where: { id: existing.id },
          data: { label: row.label, price: row.price, imageUrl },
        });
      } else {
        await prisma.fabricItem.create({
          data: {
            fabricId: row.id,
            label: row.label,
            price: row.price,
            imageUrl,
            brandId: brand.id,
          },
        });
      }
      created.push(row.id);
    }


    return NextResponse.json({ brand: brand.name, created });
  } catch (error: any) {
    console.error('Fabric upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE /api/fabrics ───────────────────────────────────
// Admin only. Requires ?id=fabricItemId
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Fabric ID is required' }, { status: 400 });
    }

    await prisma.fabricItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fabric delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
