'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export default function PasswordInput({ className = '', style, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`w-full rounded-md border py-2 pl-4 pr-11 text-sm outline-none ${className}`}
        style={{
          borderColor: 'var(--color-line)',
          color: 'var(--color-ink)',
          ...style,
        }}
      />
      <button
        type="button" // form eka submit wenna epa
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center"
        style={{ color: 'var(--color-muted)' }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}