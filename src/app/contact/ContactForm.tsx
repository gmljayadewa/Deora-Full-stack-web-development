'use client';

import { useState } from 'react';
import { MessageCircle, Mail } from 'lucide-react';

const inputClass = 'w-full rounded-md border px-4 py-2.5 text-sm outline-none';

export default function ContactForm({
  whatsapp,
  email,
}: {
  whatsapp: string;
  email: string;
}) {
  const [name, setName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const buildText = () =>
    `Hello Deora, my name is ${name.trim()}.\n\n${message.trim()}` +
    (replyTo.trim() ? `\n\nMy email: ${replyTo.trim()}` : '');

  const validate = () => {
    if (!name.trim() || !message.trim()) {
      setError('Please enter your name and your message.');
      return false;
    }
    setError('');
    return true;
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(buildText())}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const sendEmail = () => {
    if (!validate()) return;
    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(`Message from ${name.trim()}`)}` +
      `&body=${encodeURIComponent(buildText())}`;
  };

  return (
    <div
      className="rounded-2xl border p-6 sm:p-8"
      style={{ borderColor: 'var(--color-line)', background: 'white' }}
    >
      <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
        Send us a message
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        Write your message and choose how you want to send it.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="c-name" className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Name
          </label>
          <input
            id="c-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1`}
            style={{ borderColor: 'var(--color-line)' }}
          />
        </div>

        <div>
          <label htmlFor="c-email" className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Your email <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
          </label>
          <input
            id="c-email"
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            className={`${inputClass} mt-1`}
            style={{ borderColor: 'var(--color-line)' }}
          />
        </div>

        <div>
          <label htmlFor="c-message" className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Message
          </label>
          <textarea
            id="c-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} mt-1`}
            style={{ borderColor: 'var(--color-line)' }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={sendWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-brand-dark)' }}
          >
            <MessageCircle size={16} />
            Send on WhatsApp
          </button>
          <button
            type="button"
            onClick={sendEmail}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--color-brand-dark)', color: 'var(--color-brand-dark)' }}
          >
            <Mail size={16} />
            Send by Email
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Your message opens in WhatsApp or your email app. We do not store it on this website.
        </p>
      </div>
    </div>
  );
}