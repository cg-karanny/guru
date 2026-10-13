import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const REQUIRED_FIELDS = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'] as const;
type AddressKindValue = 'DELIVERY' | 'BILLING';

type AddressPayload = {
  kind: AddressKindValue;
  label: string | null;
  fullName: string;
  email: string;
  phone: string;
  phoneCode: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

function valueFrom(body: Record<string, unknown>, key: string, fallback = '') {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

function cleanAddressPayload(body: unknown): { payload: AddressPayload } | { error: string } {
  const source = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const kind: AddressKindValue = source.kind === 'BILLING' ? 'BILLING' : 'DELIVERY';
  const payload: AddressPayload = {
    kind,
    label: valueFrom(source, 'label') || null,
    fullName: valueFrom(source, 'fullName'),
    email: valueFrom(source, 'email'),
    phone: valueFrom(source, 'phone'),
    phoneCode: valueFrom(source, 'phoneCode', '+1'),
    address: valueFrom(source, 'address'),
    city: valueFrom(source, 'city'),
    state: valueFrom(source, 'state'),
    zip: valueFrom(source, 'zip'),
    country: valueFrom(source, 'country'),
    isDefault: source.isDefault === true,
  };

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      return { error: `${field} is required` };
    }
  }

  return { payload };
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const parsed = cleanAddressPayload(await req.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const existing = await prisma.userAddress.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    if (parsed.payload.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: session.id, kind: parsed.payload.kind, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data: parsed.payload,
    });

    return NextResponse.json(address);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update address';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const existing = await prisma.userAddress.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    await prisma.userAddress.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete address';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
