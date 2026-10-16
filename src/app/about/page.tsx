import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ShieldCheck, Heart, MapPin, Package, Truck, ArrowRight } from 'lucide-react';

// Set a flag to true after you add that image to public/images/about/
const IMAGES = {
  hero: { src: '/images/about/hero.jpg', ready: true },
  story: { src: '/images/about/story.jpg', ready: true },
  sourcing: { src: '/images/about/sourcing.jpg', ready: true },
};

export const metadata = {
  title: 'About Us | Deora',
  description: 'Herbal capsules, teas, spices and nutrition products inspired by Sri Lankan tradition.',
};

const VALUES = [
  { icon: Leaf, title: '100% Natural', text: 'Simple, natural ingredients. No artificial additives.' },
  { icon: ShieldCheck, title: 'Trusted Quality', text: 'We care about what goes into every pack.' },
  { icon: Heart, title: 'Made with Care', text: 'Every product is prepared and packed with attention.' },
  { icon: MapPin, title: 'Proudly Sri Lankan', text: 'Inspired by the herbs and flavours of our island.' },
];

// TODO: confirm these steps with the client before launch
const STEPS = [
  { icon: Leaf, title: 'Selected', text: 'Herbs and spices are chosen for their quality and freshness.' },
  { icon: Package, title: 'Prepared & Packed', text: 'Each product is prepared and packed with care.' },
  { icon: Truck, title: 'Delivered', text: 'Sent to your door, island-wide.' },
];

const RANGES = [
  { label: 'Herbal Capsules', category: 'Capsules', image: '/images/category/category-wellness.jpg' },
  { label: 'Herbal Tea', category: 'Tea', image: '/images/category/category-herbal-tea.png' },
  { label: 'Nutrition', category: 'Nutrition', image: '/images/category/category-nutrition.png' },
  { label: 'Spices', category: 'Spices', image: '/images/category/category-kitchen.png' },
];

// ===== EDIT THIS BLOCK WITH REAL DEORA DETAILS =====
// Leave a value as 'TODO' and it will not be shown on the page.
const STORY = {
  founded: 'TODO', // e.g. '2024'
  founder: 'TODO', // e.g. the founder's name
  location: 'TODO', // e.g. 'Town, Sri Lanka'
  products: 'TODO', // e.g. 'Capsules, teas, spices and more'
  paragraphs: [
    'TODO', // Paragraph 1: how and why Deora started
    'TODO', // Paragraph 2: where the herbs and spices come from
    'TODO', // Paragraph 3: what Deora wants for its customers
  ],
};
// ===================================================

const isFilled = (v: string) => v.trim() !== '' && !v.startsWith('TODO');

const DEFAULT_PARAGRAPHS = [
  'Deora brings together herbal capsules, herbal teas, spices and nutrition products inspired by the herbs and flavours of Sri Lanka. We believe simple, natural ingredients belong in every home.',
  'From everyday curry powders to traditional herbal teas, every product is chosen to bring a little more goodness to your daily routine.',
];

const storyParagraphs = STORY.paragraphs.filter(isFilled);
const paragraphs = storyParagraphs.length > 0 ? storyParagraphs : DEFAULT_PARAGRAPHS;

const facts = [
  { label: 'Founded', value: STORY.founded },
  { label: 'Founder', value: STORY.founder },
  { label: 'Based in', value: STORY.location },
  { label: 'What we make', value: STORY.products },
].filter((f) => isFilled(f.value));

function Photo({
  image,
  alt,
  sizes,
  priority,
}: {
  image: { src: string; ready: boolean };
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!image.ready) {
    // Placeholder shown until the real photo is added
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))' }}
      >
        <Leaf size={56} style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
    );
  }
  return <Image src={image.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[420px] w-full sm:min-h-[480px]">
          <Photo image={IMAGES.hero} alt="Herbs and spices" sizes="100vw" priority />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(27,67,50,0.88), rgba(27,67,50,0.35))' }}
          />
          <div className="relative z-10 mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-6 py-16 sm:min-h-[480px]">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              About Deora
            </span>
            <h1 className="mt-3 max-w-xl font-display text-3xl font-bold text-white sm:text-5xl">
              Savour the Goodness of Nature
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/90">
              Herbal capsules, teas, spices and nutrition products, inspired by Sri Lankan tradition.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-medium"
                style={{ color: 'var(--color-brand-dark)' }}
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center rounded-md border border-white/70 px-6 py-2.5 text-sm font-medium text-white"
              >
                Read Our Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
            <div
              className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl"
              style={{ background: 'rgba(27, 67, 50, 0.12)' }}
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Photo image={IMAGES.story} alt="Deora products" sizes="(max-width: 1024px) 100vw, 448px" />
            </div>
          </div>

          <div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-brand)' }}
            >
              Our Story
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
              Rooted in Nature, Built on Trust
            </h2>

            {paragraphs.map((text, i) => (
              <p
                key={i}
                className="mt-4 text-sm leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                {text}
              </p>
            ))}

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-lg border p-3"
                    style={{ borderColor: 'var(--color-line)' }}
                  >
                    <dt
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="mt-6 text-xs" style={{ color: 'var(--color-muted)' }}>
              Our products are food and herbal supplements. They are not medicine and do not
              replace medical treatment.
            </p>
          </div>
        </div>
      </section>

      {/* From leaf to pack */}
      <section style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-brand)' }}
              >
                How It Works
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
                From Leaf to Pack
              </h2>
              <div className="mt-8 space-y-6">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <div key={title} className="flex gap-4">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: 'var(--color-brand-dark)' }}
                    >
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                        {i + 1}. {title}
                      </h3>
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Photo image={IMAGES.sourcing} alt="Herbs being prepared" sizes="(max-width: 1024px) 100vw, 560px" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          What We Stand For
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border p-6 text-center transition-transform hover:-translate-y-1"
              style={{ borderColor: 'var(--color-line)' }}
            >
              <span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'rgba(27, 67, 50, 0.1)' }}
              >
                <Icon size={24} style={{ color: 'var(--color-brand-dark)' }} />
              </span>
              <h3 className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we make */}
      <section style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            What We Make
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {RANGES.map((r) => (
              <Link
                key={r.category}
                href={`/shop?category=${encodeURIComponent(r.category)}`}
                className="group relative block aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={r.image}
                  alt={r.label}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(27,67,50,0.85), transparent 55%)' }}
                />
                <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-sm font-semibold text-white">
                  {r.label}
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div
          className="rounded-2xl px-6 py-12 text-center text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))' }}
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to Savour the Goodness?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/90">
            Explore our herbal capsules, teas, spices and nutrition products.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-medium"
            style={{ color: 'var(--color-brand-dark)' }}
          >
            Browse Our Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}