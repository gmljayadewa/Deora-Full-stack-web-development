import Link from 'next/link';
import { XCircle, ShoppingCart, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Payment Cancelled | Deora',
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <span
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'rgba(180, 83, 9, 0.1)' }}
      >
        <XCircle size={40} style={{ color: '#b45309' }} />
      </span>

      <h1
        className="mt-6 font-display text-2xl font-bold sm:text-3xl"
        style={{ color: 'var(--color-ink)' }}
      >
        Payment cancelled
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--color-muted)' }}>
        You cancelled the payment, so nothing was charged. You can go back and try again whenever
        you are ready.
     </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white"
          style={{ background: 'var(--color-brand-dark)' }}
        >
          <ShoppingCart size={16} />
          Back to Cart
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium"
          style={{ borderColor: 'var(--color-brand-dark)', color: 'var(--color-brand-dark)' }}
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>

      <p className="mt-8 text-xs" style={{ color: 'var(--color-muted)' }}>
        If you think you were charged, please{' '}
        <Link href="/contact" className="underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}