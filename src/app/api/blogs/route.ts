import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3 } from '@/lib/s3';

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const excerpt = formData.get('description') as string;
    const content = formData.get('content') as string;
    const file = formData.get('image') as File | null;

    if (!title || !excerpt) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let imageUrl = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `blogs/blog_${slug}_${Date.now()}.${ext}`;
      
      imageUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');
    }

    const newBlog = await prisma.blogPost.create({
      data: {
        title,
        excerpt,
        content: content || excerpt,
        slug,
        imageUrl,
      }
    });

    return NextResponse.json(newBlog);
  } catch (error: any) {
    console.error('Blog creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
