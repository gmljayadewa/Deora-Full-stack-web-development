import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div
        className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl px-8 py-10 sm:grid-cols-2"
        style={{ background: 'var(--color-surface)' }}
      >
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ background: 'var(--color-secondary)', color: 'var(--color-ink)' }}
          >
            Best Seller
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl" style={{ color: 'var(--color-brand-dark)' }}>
            Nature&apos;s Comfort
            <br />
            for Your Health.
          </h2>
          <p className="mt-3 max-w-sm text-sm" style={{ color: 'var(--color-muted)' }}>
            Boost your immunity every day with our best-selling herbal teas.
          </p>
          <p className="mt-4 text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
            Rs. 1,200.00
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-brand-dark)' }}
          >
            Shop Best Sellers <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative h-56 w-full overflow-hidden rounded-xl sm:h-72">
          <Image src="/images/D-lotustea.png" alt="Keselmuwa capsules and herbal tea" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}
