import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { generatePasswordChangeEmail } from '@/lib/email-templates';
import { getSiteBrandSettings } from '@/lib/site-settings';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    
    const otpRecord = await prisma.otp.findUnique({
      where: { email_type: { email: emailLower, type: 'FORGOT_PASSWORD' } }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP requested for this email' }, { status: 400 });
    }
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }
    if (otpRecord.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: emailLower },
      data: { password: hashed }
    });

    await prisma.otp.delete({ where: { id: otpRecord.id } });

    const { siteName, siteLogo } = await getSiteBrandSettings();

    const htmlContent = generatePasswordChangeEmail(siteName, siteLogo);
    
    await sendMail({
      to: emailLower,
      subject: `Your Password has been changed - ${siteName}`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
