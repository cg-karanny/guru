import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isWishlistItem, wishlistKey } from '@/lib/wishlist';
import { createHash } from 'node:crypto';

const keyFor = (item: Parameters<typeof wishlistKey>[0]) => createHash('sha256').update(wishlistKey(item)).digest('hex');

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.wishlistItem.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(rows.map(row => row.data));
  } catch (error) {
    console.error('Wishlist load failed:', error);
    return NextResponse.json({ error: 'Unable to load wishlist.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  const items = Array.isArray(body) ? body : [body];
  if (items.length > 100 || !items.every(isWishlistItem)) {
    return NextResponse.json({ error: 'Invalid wishlist items.' }, { status: 400 });
  }
  try {
    await prisma.$transaction(items.map(item => prisma.wishlistItem.upsert({
      where: { userId_key: { userId: session.id, key: keyFor(item) } },
      create: { userId: session.id, key: keyFor(item), data: item as unknown as Prisma.InputJsonValue },
      update: { data: item as unknown as Prisma.InputJsonValue },
    })));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist save failed:', error);
    return NextResponse.json({ error: 'Unable to save wishlist.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let item: unknown;
  try { item = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  if (!isWishlistItem(item)) return NextResponse.json({ error: 'Invalid wishlist item.' }, { status: 400 });
  try {
    await prisma.wishlistItem.deleteMany({ where: { userId: session.id, key: keyFor(item) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist removal failed:', error);
    return NextResponse.json({ error: 'Unable to remove wishlist item.' }, { status: 500 });
  }
}
