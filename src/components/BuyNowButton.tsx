'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, MessageCircle, Banknote, CreditCard, Landmark } from 'lucide-react';
import type { Product } from '@/lib/products';
import { saveBuyNow, PAY_LABELS, type PayMethod } from '@/lib/buyNow';

const METHODS: { id: PayMethod; desc: string; icon: React.ReactNode }[] = [
  { id: 'WHATSAPP', desc: 'Send your order details directly to the shop on WhatsApp.', icon: <MessageCircle size={22} /> },
  { id: 'COD', desc: 'Place the order now and pay when it is delivered.', icon: <Banknote size={22} /> },
  { id: 'CARD', desc: 'Pay online securely before your order is confirmed.', icon: <CreditCard size={22} /> },
  { id: 'BANK', desc: 'Place the order now and send the payment using the bank details provided.', icon: <Landmark size={22} /> },
];

export default function BuyNowButton({
  product,
  quantity = 1,
  className = '',
}: {
  product: Product;
  quantity?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const choose = (method: PayMethod) => {
    saveBuyNow(product, quantity);
    router.push(`/checkout?method=${method}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-md font-semibold text-white transition-transform hover:-translate-y-0.5 ${className}`}
        style={{ background: '#b91c1c' }}
      >
        Buy Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border"
            >
              <X size={16} />
            </button>

            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Choose payment method
            </p>
            <h2 className="mt-1 text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
              Select how you want to order
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => choose(m.id)}
                  className="flex items-center gap-4 rounded-xl border p-4 text-left hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <span style={{ color: 'var(--color-brand)' }}>{m.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                      {PAY_LABELS[m.id]}
                    </span>
                    <span className="block text-xs" style={{ color: 'var(--color-muted)' }}>
                      {m.desc}
                    </span>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}