import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

type Category = {
  slug: string;
  label: string;
  image: string;
  category: string; // must match a category value in lib/products.ts
};

const CATEGORIES: Category[] = [
  { slug: 'herbal-capsules', label: 'Herbal Capsules', image: '/categories/herbal-capsules.jpg', category: 'Wellness' },
  { slug: 'herbal-tea-bags', label: 'Herbal Tea Bags', image: '/categories/herbal-tea-bags.jpg', category: 'Herbal Tea' },
  { slug: 'nutrition-products', label: 'Nutrition Products', image: '/categories/nutrition-products.jpg', category: 'Nutrition' },
  { slug: 'spices', label: 'Spices', image: '/categories/spices.jpg', category: 'Kitchen Essentials' },
];

export default function ShopByCategory() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Shop By Category
        </h2>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--color-brand)' }}
        >
          View All Categories <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${encodeURIComponent(cat.category)}`}
            className="group block"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg" style={{ background: 'var(--color-surface)' }}>
              <Image src={cat.image} alt={cat.label} fill className="object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                {cat.label}
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:translate-x-1"
                style={{ background: 'var(--color-brand-dark)' }}
              >
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}