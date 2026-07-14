import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { OrderStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resolvedParams = await params;
    const { status } = await req.json();
    const validStatuses = ['PENDING', 'ORDER_RECEIVED', 'STITCHING', 'PROCESSING', 'PACKING', 'SHIPPING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const validStatus = typeof status === 'string' && validStatuses.includes(status);
    if (!validStatus) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status: status as any },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
