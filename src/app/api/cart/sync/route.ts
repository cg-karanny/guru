import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartData = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { cartData }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { cartData: true }
    });

    return NextResponse.json({ cartData: user?.cartData || [] });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
