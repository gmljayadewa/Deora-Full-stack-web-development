import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../lib/blog-posts';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogsSection() {
  const posts = BLOG_POSTS.slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
          From Our Blog
        </h2>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--color-brand)' }}
        >
          View All Posts <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <div
              className="relative aspect-[4/3] w-full overflow-hidden p-4"
              style={{ background: 'var(--color-surface)' }}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {formatDate(post.date)}
              </span>
              <h3
                className="mt-2 line-clamp-2 text-base font-semibold"
                style={{ color: 'var(--color-ink)' }}
              >
                {post.title}
              </h3>
              <p
                className="mt-2 line-clamp-2 text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                {post.excerpt}
              </p>
              <span
                className="mt-4 flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--color-brand)' }}
              >
                Read More <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
