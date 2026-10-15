import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { BLOG_POSTS, getPostBySlug } from '../../../lib/blog-posts';

type Params = Promise<{ slug: string }>;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post ? `${post.title} | Deora` : 'Blog | Deora',
    description: post?.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/blog">Blog</Link>
        <ChevronRight size={14} />
        <span className="line-clamp-1" style={{ color: 'var(--color-ink)' }}>
          {post.title}
        </span>
      </div>

      <h1
        className="mt-6 font-display text-2xl font-bold sm:text-3xl"
        style={{ color: 'var(--color-ink)' }}
      >
        {post.title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
        {formatDate(post.date)} · {post.readTime}
      </p>

      {post.image && (
        <div
          className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg"
          style={{ background: 'var(--color-surface)' }}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain p-6"
          />
        </div>
      )}

      <div className="mt-8 space-y-6">
        {post.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2
                className="font-display text-lg font-bold"
                style={{ color: 'var(--color-ink)' }}
              >
                {section.heading}
              </h2>
            )}

            {section.paragraphs?.map((text, j) => (
              <p
                key={j}
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                {text}
              </p>
            ))}

            {section.list && (
              <ul
                className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                {section.list.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-10 inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--color-brand)' }}
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>
    </article>
  );
}