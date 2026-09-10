import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blogs & Events | Deora',
  description: 'Health tips, product stories, and updates from the Deora family.',
};

type Post = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
};

const POSTS: Post[] = [
  {
    slug: '10-health-benefits-of-moringa',
    date: 'May 10, 2025',
    title: '10 Health Benefits of Moringa',
    excerpt: 'Discover the amazing health benefits of moringa and why it is called a superfood.',
  },
  {
    slug: 'why-herbal-tea-is-good-for-you',
    date: 'May 05, 2025',
    title: 'Why Herbal Tea is Good for You?',
    excerpt: 'Herbal teas are natural, caffeine-free and packed with goodness.',
  },
  {
    slug: 'the-power-of-natural-spices',
    date: 'Apr 28, 2025',
    title: 'The Power of Natural Spices',
    excerpt: 'Natural spices not only enhance flavor but also support overall wellness.',
  },
];

export default function BlogsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        Blogs & Events
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
        Health tips, product stories, and updates from the Deora family.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            className="rounded-lg border p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <div
              className="mb-4 h-40 w-full rounded-md"
              style={{ background: 'var(--color-surface)' }}
              aria-hidden="true"
            />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {post.date}
            </span>
            <h2 className="mt-1 font-display text-base font-semibold" style={{ color: 'var(--color-ink)' }}>
              {post.title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              {post.excerpt}
            </p>
            <span
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-brand)' }}
            >
              Read More <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
