import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../../lib/blog-posts';

export const metadata = {
  title: 'Blog | Deora',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        Blog
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        Simple tips on herbal teas, storage and cooking with Sri Lankan spices.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <div
              className="relative aspect-[4/3] w-full"
              style={{ background: 'var(--color-surface)' }}
            >
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-4"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {formatDate(post.date)} · {post.readTime}
              </span>
              <h2
                className="mt-2 line-clamp-2 text-base font-semibold"
                style={{ color: 'var(--color-ink)' }}
              >
                {post.title}
              </h2>
              <p
                className="mt-2 line-clamp-3 text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                {post.excerpt}
              </p>
              <span
                className="mt-4 flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--color-brand)' }}
              >
                Read more <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}