import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    const existingBlog = await prisma.blogPost.findUnique({ where: { id: resolvedParams.id } });
    if (existingBlog?.imageUrl && existingBlog.imageUrl.includes('amazonaws.com')) {
      await deleteFromS3(existingBlog.imageUrl);
    }

    await prisma.blogPost.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const excerpt = formData.get('description') as string;
    const content = formData.get('content') as string;
    const file = formData.get('image') as File | null;

    if (!title || !excerpt) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let imageUrl = undefined;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `blogs/blog_${slug}_${Date.now()}.${ext}`;
      
      imageUrl = await uploadToS3(buffer, filename, file.type || 'image/jpeg');
      
      const existingBlog = await prisma.blogPost.findUnique({ where: { id: resolvedParams.id } });
      if (existingBlog?.imageUrl && existingBlog.imageUrl.includes('amazonaws.com')) {
        await deleteFromS3(existingBlog.imageUrl);
      }
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        excerpt,
        content: content || excerpt,
        slug,
        ...(imageUrl && { imageUrl })
      }
    });

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
