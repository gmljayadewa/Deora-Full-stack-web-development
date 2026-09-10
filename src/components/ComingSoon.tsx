import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <Construction size={40} className="mx-auto" style={{ color: 'var(--color-brand)' }} />
      <h1 className="mt-4 font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        {title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
        This page is coming soon. We&apos;re working on it!
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white"
        style={{ background: 'var(--color-brand)' }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
    </div>
  );
}