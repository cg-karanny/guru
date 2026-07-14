import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/media?prefix=shape_
// Returns all media items whose key starts with the given prefix
export async function GET(req: NextRequest) {
  try {
    const prefix = req.nextUrl.searchParams.get('prefix') ?? '';
    const items = await prisma.media.findMany({
      where: prefix ? { key: { startsWith: prefix } } : undefined,
      orderBy: { key: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
