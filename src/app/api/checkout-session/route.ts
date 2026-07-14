import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-02-24.acacia',
    });

    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = order.items as any[];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const line_items = items.map((item) => {
      // Validate image URL. Stripe requires a valid absolute HTTP/HTTPS URL.
      let validImages: string[] = [];
      if (item.image) {
        // Simple check if it's a valid external URL
        if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
          // Extra safety: only include if it does not contain localhost as Stripe rejects it
          if (!item.image.includes('localhost')) {
            validImages = [item.image];
          }
        } else if (item.image.startsWith('/') && !siteUrl.includes('localhost')) {
          validImages = [`${siteUrl}${item.image}`];
        }
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: validImages,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add Delivery Charge only if it exists and is greater than 0
    if (order.deliveryCharge && order.deliveryCharge > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Charge',
            images: [],
          },
          unit_amount: Math.round(order.deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${siteUrl}/api/checkout-session/callback?action=success&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${siteUrl}/api/checkout-session/callback?action=cancel&order_id=${order.id}`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
