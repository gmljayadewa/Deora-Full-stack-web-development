'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}.00`;
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return; // guard against double-click
    setLoading(true);

    try {
      // Sending the order request to the backend
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: `${formData.address},${formData.city},${formData.postalCode},${formData.province}`,
        }),
      });

      // Handling Unauthorized / Failed Responses
      if (res.status === 401) {
        alert('Please log in to continue.');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to create order');

      // Parsing the response
      const data = await res.json();

      if (!data.hash || !data.orderId || !data.merchantId) {
        throw new Error('Invalid response from server');
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payhere.lk/pay/checkout';

      // Splitting the full name into first and last name for the payment gateway
      const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;

      // Assembling the fields object
      const fields: Record<string, string> = {
        merchant_id: data.merchantId,
        return_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
        notify_url: `${window.location.origin}/api/payment/notify`,
        order_id: data.orderId,
        items: items.map(({ product }) => product.name).join(','),
        currency: data.currency,
        amount: data.amount,
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: 'Sri Lanka',
        hash: data.hash,
      };

      // Injecting fields as hidden inputs
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // No setLoading(false) here on purpose — the page is navigating away to PayHere
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false); // only reset on error — on success, page navigates away anyway
    }
  };

  if (items.length === 0) {
    router.push('/shop');
    return null;
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
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-brand)' }}
          >
            {loading ? 'Processing...' : 'Place Order'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}