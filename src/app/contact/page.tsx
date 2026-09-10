'use client';

import { useState, type FormEvent } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Frontend-only for now — wiring this to an email service/API is a
    // backend task (Week 6+), not part of this page.
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Get in Touch
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--color-muted)' }}>
          Have a question about our products or your order? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Contact info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(27, 67, 50, 0.1)' }}
            >
              <Phone size={18} style={{ color: 'var(--color-brand-dark)' }} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Phone</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>+94 77 123 4567</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(27, 67, 50, 0.1)' }}
            >
              <Mail size={18} style={{ color: 'var(--color-brand-dark)' }} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Email</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>info@deora.lk</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(27, 67, 50, 0.1)' }}
            >
              <MapPin size={18} style={{ color: 'var(--color-brand-dark)' }} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Address</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>123, Green Path, Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--color-line)' }}>
          {submitted ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={40} className="mx-auto" style={{ color: 'var(--color-brand)' }} />
              <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Message sent! We&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Email</label>
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
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white"
                style={{ background: 'var(--color-brand)' }}
              >
                Send Message <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}