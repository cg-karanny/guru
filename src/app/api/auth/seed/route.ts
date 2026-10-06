import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminHashed = await bcrypt.hash('Testpassword@123', 12);
    const userHashed = await bcrypt.hash('Testpassword@123', 12);

    await prisma.user.upsert({
      where: { email: 'admin.soften@gmail.com' },
      update: { role: 'ADMIN', password: adminHashed },
      create: {
        name: 'Admin User',
        email: 'admin.soften@gmail.com',
        password: adminHashed,
        role: 'ADMIN',
      },
    });

    await prisma.user.upsert({
      where: { email: 'paramveer.soften@gmail.com' },
      update: { role: 'USER', password: userHashed },
      create: {
        name: 'Sample User',
        email: 'paramveer.soften@gmail.com',
        password: userHashed,
        role: 'USER',
      },
    });

    return NextResponse.json({ message: 'Seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
