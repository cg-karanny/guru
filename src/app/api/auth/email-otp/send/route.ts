import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getSiteBrandSettings } from '@/lib/site-settings';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, type } = await req.json();

    // type can be 'EXISTING_EMAIL' or 'NEW_EMAIL'
    if (!email || !type || !['EXISTING_EMAIL', 'NEW_EMAIL'].includes(type)) {
      return NextResponse.json({ error: 'Invalid email or type' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if new email is already in use
    if (type === 'NEW_EMAIL' && email !== user.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return NextResponse.json({ error: 'Email already in use by another account.' }, { status: 409 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const otpKey = `${email}_${type}`;
    await prisma.otp.upsert({
      where: { email_type: { email, type: otpKey } },
      update: { code: otp, expiresAt },
      create: { email, code: otp, type: otpKey, expiresAt },
    });

    // Send OTP email
    const { siteName, siteLogo } = await getSiteBrandSettings();

    const { sendMail } = await import('@/lib/mail');
    const { generateEmailVerificationOtpEmail } = await import('@/lib/email-templates');
    const htmlContent = generateEmailVerificationOtpEmail(otp, type === 'EXISTING_EMAIL' ? 'Verify Existing Email' : 'Verify New Email', siteName, siteLogo);

    await sendMail({
      to: email,
      subject: `Verify Your Email Address - ${siteName}`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });

    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email}. It will expire in 10 minutes.` 
    });
  } catch (error: any) {
    console.error('[Email OTP Send Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
