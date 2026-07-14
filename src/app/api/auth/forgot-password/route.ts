import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { generateOtpEmail } from '@/lib/email-templates';
import { getSiteBrandSettings } from '@/lib/site-settings';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.upsert({
      where: { email_type: { email: emailLower, type: 'FORGOT_PASSWORD' } },
      update: { code, expiresAt },
      create: { email: emailLower, type: 'FORGOT_PASSWORD', code, expiresAt }
    });

    const { siteName, siteLogo } = await getSiteBrandSettings();

    const htmlContent = generateOtpEmail(code, 'FORGOT_PASSWORD', siteName, siteLogo);
    
    await sendMail({
      to: emailLower,
      subject: `Password Reset Request - ${siteName}`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });

    return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
