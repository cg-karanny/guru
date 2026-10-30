import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { PAGE_CONTENT_KEYS, PAGE_PATHS, type ManagedPage } from '@/lib/pageContent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.setting.findMany({ where: { key: { in: PAGE_CONTENT_KEYS.map(page => `pageContent:${page}`) } } });
  const content = Object.fromEntries(rows.map(row => [row.key.replace('pageContent:', ''), row.value]));
  return NextResponse.json(content);
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const page = body?.page as ManagedPage;
    const content = body?.content;
    if (!PAGE_CONTENT_KEYS.includes(page) || !content || typeof content !== 'object' || Array.isArray(content)) {
      return NextResponse.json({ error: 'Invalid page content.' }, { status: 400 });
    }
    const value = JSON.stringify(content);
    if (value.length > 200_000) return NextResponse.json({ error: 'Page content is too large.' }, { status: 413 });
    await prisma.setting.upsert({
      where: { key: `pageContent:${page}` },
      update: { value },
      create: { key: `pageContent:${page}`, value },
    });
    revalidatePath(PAGE_PATHS[page]);
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: 'Could not save page content.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const page = new URL(req.url).searchParams.get('page');
  if (!page || !PAGE_CONTENT_KEYS.includes(page as (typeof PAGE_CONTENT_KEYS)[number])) {
    return NextResponse.json({ error: 'Invalid page.' }, { status: 400 });
  }
  await prisma.setting.deleteMany({ where: { key: `pageContent:${page}` } });
  revalidatePath(PAGE_PATHS[page as (typeof PAGE_CONTENT_KEYS)[number]]);
  return NextResponse.json({ deleted: true });
}
