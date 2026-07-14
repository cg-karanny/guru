import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminHashed = await bcrypt.hash('adminpassword123', 12);
    const userHashed = await bcrypt.hash('userpassword123', 12);

    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { role: 'ADMIN', password: adminHashed },
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminHashed,
        role: 'ADMIN',
      },
    });

    await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: { role: 'USER', password: userHashed },
      create: {
        name: 'Sample User',
        email: 'user@example.com',
        password: userHashed,
        role: 'USER',
      },
    });

    return NextResponse.json({ message: 'Seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
