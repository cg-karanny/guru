import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { generatePasswordChangeEmail } from '@/lib/email-templates';
import { getSiteBrandSettings } from '@/lib/site-settings';

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Email, reset token, and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    
    const resetRecord = await prisma.otp.findUnique({
      where: { email_type: { email: emailLower, type: 'FORGOT_PASSWORD' } }
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'No password reset was requested for this email' }, { status: 400 });
    }
    if (resetRecord.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { id: resetRecord.id } });
      return NextResponse.json({ error: 'Password reset link has expired' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedHash = Buffer.from(resetRecord.code, 'hex');
    const incomingHash = Buffer.from(tokenHash, 'hex');
    if (storedHash.length !== incomingHash.length || !crypto.timingSafeEqual(storedHash, incomingHash)) {
      return NextResponse.json({ error: 'Invalid password reset link' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: emailLower },
      data: { password: hashed }
    });

    await prisma.otp.delete({ where: { id: resetRecord.id } });

    const { siteName, siteLogo } = await getSiteBrandSettings();

    const htmlContent = generatePasswordChangeEmail(siteName, siteLogo);
    
    const sent = await sendMail({
      to: emailLower,
      subject: `Your Password has been changed - ${siteName}`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });
    if (!sent) {
      console.error('Password changed, but confirmation email failed to send.');
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
