import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const count = await prisma.newsletterSubscriber.count();
  return NextResponse.json({ count });
}
