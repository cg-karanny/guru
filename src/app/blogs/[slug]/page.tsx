import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug: resolvedParams.slug } });
  if (!post) return {};
  return { title: `${post.title} | Cushion Guru`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug: resolvedParams.slug } });
  if (!post) notFound();

  return (
    <article className="section-padding fade-in" style={{ minHeight: '100vh', background: 'var(--white)', paddingTop: 'max(120px, 15vh)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/blogs" style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--brand-accent)', display: 'inline-block', marginBottom: '2rem', textDecoration: 'none', transition: 'color 0.2s', ':hover': { color: 'var(--brand-primary)' } } as React.CSSProperties}>
          ← Back to Blogs
        </Link>

        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', lineHeight: 1.2 }}>
            {post.title}
          </h1>
          <div style={{ color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <span className="badge badge-accent">
              Blog Post
            </span>
            <span>•</span>
            <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {post.imageUrl && (
            <div style={{ width: '100%', height: 'clamp(300px, 50vh, 500px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }}>
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </header>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
