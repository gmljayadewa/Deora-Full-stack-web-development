'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../lib/products';
import { useCart } from '../context/CartContext';

export default function ProductQuantitySelector({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center overflow-hidden rounded-md border"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <button
          aria-label="Decrease quantity"
          onClick={decrease}
          className="flex h-10 w-10 items-center justify-center"
          style={{ color: 'var(--color-ink)' }}
        >
          <Minus size={16} />
        </button>
        <span className="flex h-10 w-12 items-center justify-center text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          {quantity}
        </span>
        <button
          aria-label="Increase quantity"
          onClick={increase}
          className="flex h-10 w-10 items-center justify-center"
          style={{ color: 'var(--color-ink)' }}
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        className="flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        style={{ background: added ? 'var(--color-secondary)' : 'var(--color-brand)' }}
      >
        {added ? (
          <>
            <Check size={16} />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={16} />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}