'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex];

  function scrollThumbnails(direction: 'left' | 'right') {
    if (scrollRef.current) {
      const amount = 100;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  }

  return (
    <div className="max-w-md">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-line)' }}
      >
        {activeImage ? (
          <Image src={activeImage} alt={productName} fill className="object-contain p-4" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Image
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollThumbnails('left')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-muted)' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>

          <div ref={scrollRef} className="flex gap-2 overflow-x-hidden">
            {images.map((img, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setActiveIndex(index)}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors"
                style={{
                  borderColor: activeIndex === index ? 'var(--color-brand)' : 'var(--color-line)',
                  background: 'var(--color-surface)',
                }}
              >
                <Image src={img} alt={`${productName} thumbnail ${index + 1}`} fill className="object-contain p-1" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollThumbnails('right')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-muted)' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}