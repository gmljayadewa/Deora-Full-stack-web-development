import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Sprout, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

type TrustBadge = {
  icon: typeof Leaf;
  label: string;
  sub: string;
};

const TRUST_BADGES: TrustBadge[] = [
  { icon: Leaf, label: '100%', sub: 'Natural & Organic' },
  { icon: Sprout, label: 'Premium', sub: 'Ingredients' },
  { icon: Truck, label: 'Island-wide', sub: 'Delivery' },
  { icon: ShieldCheck, label: 'Quality', sub: 'Guaranteed' },
];

export default function Hero() {
  return (
    <section>
      {/* Hero banner with background image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero-forest-bg.jpg" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Savour the
            <br />
            Goodness of
            <br />
            <span style={{ color: 'var(--color-secondary)' }}>Nature.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/90">
            Premium herbal capsules, natural tea, nutrition, and pure spices crafted for a healthier lifestyle.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--color-brand-dark)' }}
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-md border border-white px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>

      {/* Trust badges bar */}
      <div style={{ background: 'var(--color-brand-dark)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-6 sm:grid-cols-4">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={sub} className="flex items-center gap-3">
              <Icon size={22} style={{ color: 'var(--color-secondary)' }} />
              <span className="text-sm text-white">
                <span className="font-semibold">{label}</span>
                <br />
                {sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}