import Image from 'next/image';
import { Leaf, ShieldCheck, Heart, Users } from 'lucide-react';

const VALUES = [
  { icon: Leaf, title: '100% Natural', text: 'No artificial additives, ever. Just pure, honest ingredients.' },
  { icon: ShieldCheck, title: 'Quality Tested', text: 'Every batch is lab-tested for purity and potency.' },
  { icon: Heart, title: 'Made with Care', text: 'Small-batch production, handled with genuine care.' },
  { icon: Users, title: 'Community First', text: 'Supporting local farmers and Sri Lankan traditions.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: 'var(--color-brand-dark)' }}>
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base" style={{ color: 'var(--color-muted)' }}>
            Deora was founded on a simple belief: wellness should come from nature, not a lab.
            We bring you herbal capsules, teas, and pure spices rooted in Sri Lankan tradition.
          </p>
        </div>
      </section>

      {/* Story content */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
              Rooted in Nature, Built on Trust
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              What started as a small family passion for natural remedies has grown into Deora —
              a brand dedicated to bringing authentic, high-quality herbal products to every home
              in Sri Lanka and beyond. We work directly with local farmers to source the finest
              Moringa, Gotukola, Ceylon Cinnamon, and other natural ingredients, ensuring every
              product meets our strict standards for purity and effectiveness.
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Today, Deora serves thousands of customers who trust us for their daily wellness
              needs — from immunity-boosting capsules to soothing herbal teas and pure kitchen
              spices.
            </p>
          </div>
          <div
            className="relative aspect-square w-full overflow-hidden rounded-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <Image src="/images/about-story.jpg" alt="Deora products" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
            What We Stand For
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <span
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: 'rgba(27, 67, 50, 0.1)' }}
                >
                  <Icon size={24} style={{ color: 'var(--color-brand-dark)' }} />
                </span>
                <h3 className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {title}
                </h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}