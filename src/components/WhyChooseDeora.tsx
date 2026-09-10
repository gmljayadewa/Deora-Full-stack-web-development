import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Award, Leaf as LeafIcon, ShieldCheck, Truck, Quote } from 'lucide-react';

const REASONS = [
  { icon: Award, label: 'High Quality', sub: 'Premium quality products' },
  { icon: LeafIcon, label: 'Natural Processing', sub: 'No artificial additives' },
  { icon: ShieldCheck, label: 'Secure Payments', sub: '100% safe & secure' },
  { icon: Truck, label: 'Fast Delivery', sub: 'Quick island-wide delivery' },
];

const TESTIMONIALS = [
  { quote: 'Deora products have made a huge difference in my daily wellness routine. Highly recommended!', name: 'Nirosha Perera', rating: 5 },
  { quote: 'Excellent quality and amazing customer service. My favorite herbal tea!', name: 'Chaminda Silva', rating: 5 },
  { quote: '100% natural products you can trust for a healthier lifestyle.', name: 'Sanduni Wijesinghe', rating: 5 },
];

export default function WhyChooseDeora() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_1.4fr]">
        {/* Special offer banner */}
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6"
          style={{ background: 'var(--color-brand-dark)' }}
        >
          <div className="absolute inset-0 opacity-30">
            <Image src="/images/wellness-bundle.png" alt="" fill className="object-cover" />
          </div>
          <div className="relative">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--color-secondary)', color: 'var(--color-ink)' }}
            >
              Special Offer
            </span>
            <p className="mt-3 text-lg font-bold text-white">Up to 20% OFF on Wellness Bundles</p>
          </div>
          <Link
            href="/shop"
            className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold"
            style={{ color: 'var(--color-brand-dark)' }}
          >
            Shop Now <ArrowRight size={14} />
          </Link>
        </div>

        {/* Why Choose Deora */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)' }}>
          <h3 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
            Why Choose Deora?
          </h3>
          <ul className="mt-4 flex flex-col gap-4">
            {REASONS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon size={18} style={{ color: 'var(--color-brand)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                    {label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {sub}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
            What Our Customers Say
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, name, rating }: { quote: string; name: string; rating: number }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--color-line)' }}>
      <Quote size={18} style={{ color: 'var(--color-secondary)' }} />
      <p className="mt-2 text-sm" style={{ color: 'var(--color-ink)' }}>
        {quote}
      </p>
      <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
        — {name}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-secondary)' }}>
        {'★'.repeat(rating)}
      </p>
    </div>
  );
}
