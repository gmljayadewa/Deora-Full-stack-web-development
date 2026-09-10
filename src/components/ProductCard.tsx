'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../lib/products';
import { useCart } from '../context/CartContext';

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}.00`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="flex flex-col rounded-lg border p-3"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <div className="relative">
        <div
          className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md"
          style={{ background: 'var(--color-surface)' }}
        >
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Image
            </span>
          )}
        </div>
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
        >
          <Heart size={14} style={{ color: 'var(--color-muted)' }} />
        </button>
      </div>

      {product.category && (
        <span
          className="mt-3 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-brand)' }}
        >
          {product.category}
        </span>
      )}

      <Link
        href={`/products/${product.id}`}
        className={`line-clamp-2 min-h-[2.5rem] text-sm font-medium ${product.category ? '' : 'mt-3'}`}
        style={{ color: 'var(--color-ink)' }}
      >
        {product.name}
      </Link>

      <div className="mt-1 flex items-center gap-1">
        <Star size={12} fill="var(--color-secondary)" style={{ color: 'var(--color-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {product.rating} ({product.reviewCount})
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
        {formatPrice(product.price)}
      </p>

      <button
        onClick={handleAddToCart}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5"
        style={{ background: added ? 'var(--color-secondary)' : 'var(--color-brand)' }}
      >
        {added ? (
          <>
            <Check size={14} />
            Added
          </>
        ) : (
          <>
            <ShoppingCart size={14} />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}