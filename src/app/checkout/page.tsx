'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}.00`;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Week 5 scope: frontend-only checkout UI. Real order creation +
    // payment gateway (PayHere) integration happens in Week 7, once the
    // backend/database is set up.
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
    router.push('/shop');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <CheckCircle2 size={48} className="mx-auto" style={{ color: 'var(--color-brand)' }} />
        <h1 className="mt-4 font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          Thank you for your order. We&apos;ll send a confirmation to your email shortly.
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
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* Left: Customer details + Address */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
              Customer Details
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
              Delivery Address
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Street Address
                </label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  City
                </label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Postal Code
                </label>
                <input
                  required
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  Province
                </label>
                <input
                  required
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="h-fit rounded-lg border p-6" style={{ borderColor: 'var(--color-line)' }}>
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--color-muted)' }}>
                  {product.name} × {quantity}
                </span>
                <span style={{ color: 'var(--color-ink)' }}>
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm" style={{ borderColor: 'var(--color-line)' }}>
            <span style={{ color: 'var(--color-muted)' }}>Delivery</span>
            <span style={{ color: 'var(--color-ink)' }}>Free</span>
          </div>
          <div
            className="mt-2 flex items-center justify-between border-t pt-4 text-base font-bold"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
          >
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-brand)' }}
          >
            Place Order <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}