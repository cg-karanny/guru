import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { generatePasswordResetEmail } from '@/lib/email-templates';
import { getSiteBrandSettings } from '@/lib/site-settings';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.otp.upsert({
      where: { email_type: { email: emailLower, type: 'FORGOT_PASSWORD' } },
      update: { code: tokenHash, expiresAt },
      create: { email: emailLower, type: 'FORGOT_PASSWORD', code: tokenHash, expiresAt }
    });

    const { siteName, siteLogo } = await getSiteBrandSettings();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '');
    const resetUrl = new URL(`${siteUrl}/account/forgot-password`);
    resetUrl.searchParams.set('email', emailLower);
    resetUrl.searchParams.set('token', token);

    const htmlContent = generatePasswordResetEmail(resetUrl.toString(), siteName, siteLogo);
    
    const sent = await sendMail({
      to: emailLower,
      subject: `Password Reset Request - ${siteName}`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });

    if (!sent) {
      return NextResponse.json({ error: 'Unable to send password reset email. Please try again later.' }, { status: 502 });
    }

    return NextResponse.json({ message: 'Password reset link sent to your email' }, { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
