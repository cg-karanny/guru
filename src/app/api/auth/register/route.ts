import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { sendMail } from '@/lib/mail';
import { generateOtpEmail } from '@/lib/email-templates';
import { getSiteBrandSettings } from '@/lib/site-settings';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Settings for brand info
    const { siteName, siteLogo } = await getSiteBrandSettings();

    // Verify OTP flow
    if (otp) {
      const otpRecord = await prisma.otp.findUnique({
        where: { email_type: { email: emailLower, type: 'REGISTER' } }
      });

      if (!otpRecord) {
         return NextResponse.json({ error: 'No OTP requested for this email' }, { status: 400 });
      }
      if (otpRecord.expiresAt < new Date()) {
         return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }
      if (otpRecord.code !== otp) {
         return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      // Valid OTP: Create user
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email: emailLower, password: hashed },
      });

      // Cleanup OTP
      await prisma.otp.delete({ where: { id: otpRecord.id } });

      const response = NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      }, { status: 201 });

      await createSession(response, { id: user.id, email: user.email, role: user.role });
      return response;
    }

    // Send OTP flow
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.upsert({
      where: { email_type: { email: emailLower, type: 'REGISTER' } },
      update: { code, expiresAt },
      create: { email: emailLower, type: 'REGISTER', code, expiresAt }
    });

    const htmlContent = generateOtpEmail(code, 'REGISTER', siteName, siteLogo);
    await sendMail({
      to: emailLower,
      subject: `Your ${siteName} Registration Code`,
      html: htmlContent,
      bcc: process.env.BCC_EMAIL
    });

    return NextResponse.json({ requireOtp: true, message: 'OTP sent to email' }, { status: 200 });

  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
