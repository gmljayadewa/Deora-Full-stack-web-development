'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}.00`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <ShoppingCart size={48} className="mx-auto" style={{ color: 'var(--color-muted)' }} />
        <h1 className="mt-4 font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* Cart items list */}
        <div className="flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-lg border p-4"
              style={{ borderColor: 'var(--color-line)' }}
            >
              {/* Image */}
              <div
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md"
                style={{ background: 'var(--color-surface)' }}
              >
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Image
                    </span>
                  </div>
                )}
              </div>

              {/* Name + price */}
              <div className="flex-1">
                <Link
                  href={`/products/${product.id}`}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Quantity controls */}
              <div
                className="flex items-center overflow-hidden rounded-md border"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <button
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center"
                  style={{ color: 'var(--color-ink)' }}
                >
                  <Minus size={14} />
                </button>
                <span className="flex h-8 w-10 items-center justify-center text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center"
                  style={{ color: 'var(--color-ink)' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Line total */}
              <p className="w-24 text-right text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                {formatPrice(product.price * quantity)}
              </p>

              {/* Remove button */}
              <button
                aria-label="Remove item"
                onClick={() => removeItem(product.id)}
                style={{ color: 'var(--color-muted)' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div
          className="h-fit rounded-lg border p-6"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
            Order Summary
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
            <span style={{ color: 'var(--color-ink)' }}>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-muted)' }}>Delivery</span>
            <span style={{ color: 'var(--color-ink)' }}>Free</span>
          </div>
          <div
            className="mt-4 flex items-center justify-between border-t pt-4 text-base font-bold"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
          >
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-brand)' }}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}