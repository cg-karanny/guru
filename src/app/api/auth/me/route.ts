import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getSiteBrandSettings } from '@/lib/site-settings';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  console.log('[Auth/ME] GET request received');
  const session = await getSession(req);
  console.log('[Auth/ME] Session:', session ? `Found for ${session.email}` : 'Not found');
  
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    console.log('[Auth/ME] User not found in DB');
    return NextResponse.json({ user: null }, { status: 200 });
  }
  console.log(`[Auth/ME] Returning user: ${user.email}`);
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, currentPassword, newPassword } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id: session.id } });
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return NextResponse.json({ error: 'Email already in use by another account.' }, { status: 409 });
      updateData.email = email;
    }

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, existing.password);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    await prisma.user.update({ where: { id: session.id }, data: updateData });

    if (newPassword) {
      const { siteName, siteLogo } = await getSiteBrandSettings();

      const { sendMail } = await import('@/lib/mail');
      const { generatePasswordChangeEmail } = await import('@/lib/email-templates');
      const htmlContent = generatePasswordChangeEmail(siteName, siteLogo);
      
      await sendMail({
        to: updateData.email || existing.email,
        subject: `Your Password has been changed - ${siteName}`,
        html: htmlContent,
        bcc: process.env.BCC_EMAIL
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
