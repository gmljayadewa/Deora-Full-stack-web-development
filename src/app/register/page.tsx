'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function RegisterPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNextPath(safeNext());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Could not create your account.');
        setLoading(false);
        return;
      }

      // Log the new customer in straight away
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        router.push('/login');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
          Create your account
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          It only takes a minute.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border p-6"
        style={{ borderColor: 'var(--color-line)', background: 'white' }}
      >
        <label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          Full name
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-line)' }}
        />

        <label
          htmlFor="email"
          className="mt-4 block text-sm font-medium"
          style={{ color: 'var(--color-ink)' }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-line)' }}
        />

        <label
          htmlFor="password"
          className="mt-4 block text-sm font-medium"
          style={{ color: 'var(--color-ink)' }}
        >
          Password <span style={{ color: 'var(--color-muted)' }}>(at least 8 characters)</span>
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-line)' }}
        />

        {error && (
          <p className="mt-4 text-sm" style={{ color: '#b91c1c' }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'var(--color-brand)' }}
        >
          <UserPlus size={16} />
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
        Already have an account?{' '}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-medium underline"
          style={{ color: 'var(--color-brand)' }}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}