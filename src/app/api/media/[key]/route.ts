import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const resolvedParams = await params;
    const media = await prisma.media.findUnique({
      where: { key: resolvedParams.key }
    });
    return NextResponse.json(media || {});
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching media' }, { status: 500 });
  }
}
