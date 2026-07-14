import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { generateOrderConfirmationEmail, generatePaymentFailedEmail } from '@/lib/email-templates';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'success' or 'cancel'
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.redirect(`${req.nextUrl.origin}/cart`);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.redirect(`${req.nextUrl.origin}/cart`);
    }

    const siteSettings = await prisma.setting.findMany({
      where: { key: { in: ['siteName', 'logoUrl'] } }
    });
    const siteName = siteSettings.find(s => s.key === 'siteName')?.value || 'Cushion Guru';
    const siteLogo = siteSettings.find(s => s.key === 'logoUrl')?.value;
    const originUrl = req.nextUrl.origin;
    const customerName = (order.shippingAddr as any)?.shipping?.fullName || order.user?.name || 'Valued Customer';
    const email = order.user?.email || (order.shippingAddr as any)?.shipping?.email;

    if (action === 'success') {
      if (sessionId) {
        // verify session using stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
          apiVersion: '2025-02-24.acacia',
        });
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['total_details.breakdown']
        });
        console.log('Stripe session payment status:', session.payment_status);
        
        if (session.payment_status === 'paid' && session.amount_total !== null) {
          const actualTotal = session.amount_total / 100;
          const discountAmt = session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0;
          
          let promoNames = '';
          if (session.total_details?.breakdown?.discounts) {
            const names = session.total_details.breakdown.discounts
              .map((d: any) => d.discount?.coupon?.name || d.discount?.coupon?.id)
              .filter(Boolean);
            if (names.length > 0) promoNames = ` (${names.join(', ')})`;
          }
          
          let updatedNotes = order.notes || '';
          if (discountAmt > 0) {
            updatedNotes += updatedNotes ? ` | ` : '';
            updatedNotes += `Promo Code Applied${promoNames} (Stripe Discount: -$${discountAmt.toFixed(2)})`;
          }

          if (actualTotal !== order.total) {
            await prisma.order.update({
              where: { id: order.id },
              data: { 
                total: actualTotal,
                notes: updatedNotes
              }
            });
            order.total = actualTotal;
            order.notes = updatedNotes;
          }
        }
      }

      // Only send confirmation email after positive stripe callback
      if (email) {
        const emailHtml = generateOrderConfirmationEmail(order, siteName, siteLogo, customerName, originUrl);
        try {
          await sendMail({
             to: email,
             subject: `Order Confirmation - ${siteName}`,
             html: emailHtml,
             bcc: process.env.BCC_EMAIL
          });
        } catch(e) { console.error('Callback sendMail error', e); }
      }

      return NextResponse.redirect(`${originUrl}/account/orders?stripe_success=true&order_id=${order.id}`);
      
    } else if (action === 'cancel') {
      // Revert the stock allocation that was made on order creation
      try {
        const items = order.items as any[];
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.category === 'Non-Customizable' && item.id) {
              await prisma.product.updateMany({
                where: { id: item.id },
                data: { stock: { increment: item.quantity || 1 } },
              });
            }
          }
        }
      } catch (stockErr) {
        console.error('Stock increment error:', stockErr);
      }

      // Delete the order so it doesn't show up in the orders list
      try {
        await prisma.order.delete({
          where: { id: order.id }
        });
      } catch (deleteErr) {
        console.error('Failed to delete cancelled order:', deleteErr);
      }

      return NextResponse.redirect(`${originUrl}/cart?canceled=true`);
    }

    return NextResponse.redirect(`${originUrl}/account/orders`);
  } catch (err: any) {
    console.error('Checkout callback error:', err);
    return NextResponse.redirect(`${req.nextUrl.origin}/cart`);
  }
}
