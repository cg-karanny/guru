import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, total, status, notes, shippingAddr, billingAddr, paymentMethod, deliveryCharge } = await req.json();

    // Build safe payload values for Prisma
    const safeStatus = typeof status === 'string' && status in OrderStatus
      ? OrderStatus[status as keyof typeof OrderStatus]
      : OrderStatus.ORDER_RECEIVED;
    const safePaymentMethod = typeof paymentMethod === 'string' ? paymentMethod : 'COD';
    const safeTotal = Number(total ?? 0);
    const safeDeliveryCharge = Number(deliveryCharge ?? 0);
    const addressData = shippingAddr ? {
      shipping: shippingAddr,
      billing: billingAddr ?? shippingAddr,
    } : undefined;

    const safeItems = JSON.parse(JSON.stringify(items || []));
    const safeAddressData = addressData ? JSON.parse(JSON.stringify(addressData)) : undefined;

    const order = await prisma.order.create({
      data: {
        userId: session.id,
        items: safeItems,
        total: safeTotal,
        status: safeStatus,
        notes: notes || '',
        shippingAddr: safeAddressData,
        paymentMethod: safePaymentMethod,
        deliveryCharge: safeDeliveryCharge,
      }
    });

    // Decrement stock for non-customizable products
    try {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.category === 'Non-Customizable' && item.id) {
            await prisma.product.updateMany({
              where: { id: item.id },
              data: { stock: { decrement: item.quantity || 1 } },
            });
          }
        }
      }
    } catch (stockErr) {
      console.error('Stock decrement error:', stockErr);
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: session.id } });
      const siteSettings = await prisma.setting.findMany({
        where: { key: { in: ['siteName', 'logoUrl'] } }
      });
      const siteName = siteSettings.find(s => s.key === 'siteName')?.value || 'Cushion Guru';
      const siteLogo = siteSettings.find(s => s.key === 'logoUrl')?.value;

      if (user?.email && safePaymentMethod !== 'stripe') {
        const { sendMail } = await import('@/lib/mail');
        const { generateOrderConfirmationEmail } = await import('@/lib/email-templates');
        
        // Extract customer name for greeting
        const customerName = (order.shippingAddr as any)?.shipping?.fullName || user?.name || 'Valued Customer';
        const originUrl = req.nextUrl.origin;
        
        console.log('--- DEBUG ORDERS API ---');
        console.log('Site Name Fetched:', siteName);
        console.log('Site Logo Fetched:', siteLogo);
        console.log('Origin URL derived:', originUrl);
        console.log('Customer Name mapped:', customerName);
        console.log('------------------------');

        const emailHtml = generateOrderConfirmationEmail(order, siteName, siteLogo, customerName, originUrl);
        await sendMail({
          to: user.email,
          subject: `Order Confirmation - ${siteName}`,
          html: emailHtml,
          bcc: process.env.BCC_EMAIL
        });
      }
    } catch (mailErr) {
      console.error('Failed to send order confirmation email:', mailErr);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
      return NextResponse.json(orders);
    } else {
      const orders = await prisma.order.findMany({
        where: { 
          userId: session.id,
          status: { not: 'CANCELLED' } 
        },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
      return NextResponse.json(orders);
    }
  } catch (error: any) {
    console.error('Order fetching error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
