'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../lib/products';

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Featured Products
        </h2>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--color-brand)' }}
        >
          View All Products <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative mt-8">
        {/* Prev/Next arrows */}
        <button
          aria-label="Scroll left"
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/3 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow lg:flex"
        >
          <ChevronLeft size={18} style={{ color: 'var(--color-ink)' }} />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/3 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow lg:flex"
        >
          <ChevronRight size={18} style={{ color: 'var(--color-ink)' }} />
        </button>

        {/* Scrollable product row */}
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: 'none' }}>
          {PRODUCTS.map((product) => (
            <div key={product.id} className="w-40 shrink-0 sm:w-48">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}