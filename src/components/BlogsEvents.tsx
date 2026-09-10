import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

type Post = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
};

const POSTS: Post[] = [
  {
    slug: '10-health-benefits-of-moringa',
    date: 'May 10, 2025',
    title: '10 Health Benefits of Moringa',
    excerpt: 'Discover the amazing health benefits of moringa and why it is called a superfood.',
    image: '/images/blogs/blog-moringa.png',
  },
  {
    slug: 'why-herbal-tea-is-good-for-you',
    date: 'May 05, 2025',
    title: 'Why Herbal Tea is Good for You?',
    excerpt: 'Herbal teas are natural, caffeine-free and packed with goodness.',
    image: '/images/blogs/blog-herbal-tea.png',
  },
  {
    slug: 'the-power-of-natural-spices',
    date: 'Apr 28, 2025',
    title: 'The Power of Natural Spices',
    excerpt: 'Natural spices not only enhance flavor but also support overall wellness.',
    image: '/images/blogs/blog-spices.png',
  },
];

export default function BlogsEvents() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Blogs & Events
        </h2>
        <Link
          href="/blogs"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--color-brand)' }}
        >
          View All Posts <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            className="group rounded-lg border p-3 transition-transform hover:-translate-y-1"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <div className="relative h-40 w-full overflow-hidden rounded-md" style={{ background: 'var(--color-surface)' }}>
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
            <span className="mt-3 block text-xs" style={{ color: 'var(--color-muted)' }}>
              {post.date}
            </span>
            <h3 className="mt-1 font-display text-base font-semibold" style={{ color: 'var(--color-ink)' }}>
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'var(--color-muted)' }}>
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
    </section>
  );
}
