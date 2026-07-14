import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: { email: email.toLowerCase() },
      });

      try {
        const siteSettings = await prisma.setting.findMany({
          where: { key: { in: ['siteName', 'logoUrl'] } }
        });
        const siteName = siteSettings.find(s => s.key === 'siteName')?.value || 'Cushion Guru';

        const { sendMail } = await import('@/lib/mail');
        const { generateWelcomeEmail } = await import('@/lib/email-templates');
        
        const emailHtml = generateWelcomeEmail(siteName);
        
        await sendMail({
          to: email.toLowerCase(),
          subject: `Welcome to the ${siteName} Family! You're on the list!`,
          html: emailHtml,
        });
      } catch (mailErr) {
        console.error('Failed to send welcome email:', mailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(subscribers);
  } catch (err) {
    console.error('Failed to fetch subscribers:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

