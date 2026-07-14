import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, otp, type } = await req.json();

    // type can be 'EXISTING_EMAIL' or 'NEW_EMAIL'
    if (!email || !otp || !type || !['EXISTING_EMAIL', 'NEW_EMAIL'].includes(type)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // For existing email, verify it matches user's current email
    if (type === 'EXISTING_EMAIL' && email !== user.email) {
      return NextResponse.json({ error: 'Email does not match current email' }, { status: 400 });
    }

    // Check OTP
    const otpKey = `${email}_${type}`;
    const storedOtp = await prisma.otp.findUnique({
      where: { email_type: { email, type: otpKey } }
    });

    if (!storedOtp) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (storedOtp.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > storedOtp.expiresAt) {
      await prisma.otp.delete({ where: { id: storedOtp.id } });
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // If NEW_EMAIL, update user email
    if (type === 'NEW_EMAIL') {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: 'Email already in use by another account.' }, { status: 409 });
      }
      await prisma.user.update({
        where: { id: session.id },
        data: { email }
      });
    }

    // Delete used OTP
    await prisma.otp.delete({ where: { id: storedOtp.id } });

    // Also delete the other email OTP if both are verified
    const otherType = type === 'EXISTING_EMAIL' ? 'NEW_EMAIL' : 'EXISTING_EMAIL';
    const otherOtpKey = `${email === user.email ? 'new_email' : user.email}_${otherType}`;
    
    return NextResponse.json({ 
      success: true, 
      message: type === 'EXISTING_EMAIL' ? 'Existing email verified!' : 'New email verified and updated successfully!'
    });
  } catch (error: any) {
    console.error('[Email OTP Verify Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
