'use client';

import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <section style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div
          className="flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl px-6 py-6 shadow-lg sm:flex-row sm:px-8"
          style={{ background: 'var(--color-brand-dark)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.12)' }}
            >
              <Mail size={18} color="white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Stay Updated with our Latest Offers!</p>
              <p className="text-xs" style={{ color: '#B8C7BC' }}>
                Get special offers, health tips and new product updates.
              </p>
            </div>
          </div>
          <form className="flex w-full max-w-xl gap-2 sm:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              className="w-96 rounded-md border border-white px-4 py-2 text-sm outline-none"
              style={{ color: 'var(--color-surface)' }}
            />
            <button
              type="submit"
              className="shrink-0 rounded-md px-5 py-2 text-sm font-medium"
              style={{ background: 'var(--color-secondary)', color: 'var(--color-ink)' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
