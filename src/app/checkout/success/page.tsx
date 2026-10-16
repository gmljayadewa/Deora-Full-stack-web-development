import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, SearchX, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import SuccessEffects from './SuccessEffects';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order Status | Deora',
};

type SearchParams = Promise<{ order_id?: string | string[] }>;

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type View = 'paid' | 'cod' | 'pending' | 'failed' | 'notfound';

const VIEWS = {
  paid: {
    icon: CheckCircle2,
    color: '#15803d',
    bg: 'rgba(21, 128, 61, 0.1)',
    title: 'Thank you! Your payment was successful',
    text: 'Your order is confirmed. We will prepare it and send it to you soon.',
  },
  cod: {
    icon: CheckCircle2,
    color: '#15803d',
    bg: 'rgba(21, 128, 61, 0.1)',
    title: 'Your order is placed',
    text: 'You chose cash on delivery. Please pay when your order arrives.',
  },
  pending: {
    icon: Clock,
    color: '#b45309',
    bg: 'rgba(180, 83, 9, 0.1)',
    title: 'We are confirming your payment',
    text: 'This usually takes a few seconds. This page will update by itself. Please do not pay again.',
  },
  failed: {
    icon: XCircle,
    color: '#b91c1c',
    bg: 'rgba(185, 28, 28, 0.1)',
    title: 'Your payment did not go through',
    text: 'No problem. You can go back to your cart and try again.',
  },
  notfound: {
    icon: SearchX,
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
    title: 'We could not find your order',
    text: 'If you just paid, please contact us with your payment details and we will help you.',
  },
} as const;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
    const { order_id: rawOrderId } = await searchParams;
  // PayHere adds its own order_id to the return URL, so this can be a list
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          payment: true,
          items: { include: { product: { select: { name: true } } } },
        },
      })
    : null;

  let view: View = 'notfound';
  if (order) {
    if (order.payment?.method === 'CASH_ON_DELIVERY') view = 'cod';
    else if (order.payment?.status === 'PAID') view = 'paid';
    else if (order.payment?.status === 'FAILED') view = 'failed';
    else view = 'pending';
  }

  const v = VIEWS[view];
  const Icon = v.icon;

  // Delivery = order total minus the items. Older orders without delivery show no row.
  const itemsSubtotal = order
    ? order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
    : 0;
  const deliveryPaid = order ? Number(order.totalAmount) - itemsSubtotal : 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <SuccessEffects
        clearCartNow={view === 'paid' || view === 'cod' || view === 'pending'}
        refreshWhilePending={view === 'pending'}
      />

      <div className="text-center">
        <span
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: v.bg }}
        >
          <Icon size={40} style={{ color: v.color }} />
        </span>
        <h1
          className="mt-6 font-display text-2xl font-bold sm:text-3xl"
          style={{ color: 'var(--color-ink)' }}
        >
          {v.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--color-muted)' }}>
          {v.text}
        </p>
      </div>

      {order && view !== 'failed' && (
        <div
          className="mt-8 rounded-xl border p-5"
          style={{ borderColor: 'var(--color-line)', background: 'white' }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-muted)' }}>Order number</span>
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>
              #{order.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <ul className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-line)' }}>
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-ink)' }}>
                  {item.product.name} × {item.quantity}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  {formatPrice(Number(item.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {deliveryPaid > 0 && (
            <div className="mt-3 flex justify-between text-sm">
              <span style={{ color: 'var(--color-muted)' }}>Delivery</span>
              <span style={{ color: 'var(--color-muted)' }}>{formatPrice(deliveryPaid)}</span>
            </div>
          )}

          <div
            className="mt-4 flex justify-between border-t pt-4 text-sm font-semibold"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
          >
            <span>Total</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {view === 'failed' ? (
          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: 'var(--color-brand-dark)' }}
          >
            Back to Cart <ArrowRight size={14} />
          </Link>
        ) : (
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: 'var(--color-brand-dark)' }}
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        )}
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
          style={{ borderColor: 'var(--color-brand-dark)', color: 'var(--color-brand-dark)' }}
        >
          Need Help?
        </Link>
      </div>
    </div>
  );
}