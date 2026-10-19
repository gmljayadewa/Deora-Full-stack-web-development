'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogIn, UserPlus, Package, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthMenu() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Page eka maru unama menu eka close karanna
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menu eken eliye click karama close karanna
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const label = user ? user.name.split(' ')[0] : 'Account';

  // Login unama aye inna page ekatama yanna
  const onAuthPage = pathname === '/login' || pathname === '/register';
  const next = onAuthPage ? '' : `?next=${encodeURIComponent(pathname)}`;

  const itemClass =
    'flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50';

  return (
    <div className="relative" ref={ref}>
      {/* Account / Wishlist / Cart walata samana: icon + label */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex flex-col items-center gap-1 text-xs outline-none"
        style={{ color: 'var(--color-ink)' }}
      >
        <User size={20} />
        <span className="max-w-[72px] truncate">{label}</span>
      </button>

      {open && ready && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-lg border bg-white py-1 shadow-lg"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {user ? (
            <>
              <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-line)' }}>
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {user.name}
                </p>
                <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }}>
                  {user.email}
                </p>
              </div>

              <Link href="/account" className={itemClass} style={{ color: 'var(--color-ink)' }}>
                <User size={16} /> My Account
              </Link>
              <Link href="/account" className={itemClass} style={{ color: 'var(--color-ink)' }}>
                <Package size={16} /> My Orders
              </Link>
              <Link
                href="/account/change-password"
                className={itemClass}
                style={{ color: 'var(--color-ink)' }}
              >
                <KeyRound size={16} /> Change Password
              </Link>

              <button
                type="button"
                onClick={logout}
                className={`${itemClass} border-t`}
                style={{ borderColor: 'var(--color-line)', color: 'var(--color-muted)' }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/login${next}`}
                className={itemClass}
                style={{ color: 'var(--color-ink)' }}
              >
                <LogIn size={16} /> Log in
              </Link>
              <Link
                href={`/register${next}`}
                className={itemClass}
                style={{ color: 'var(--color-ink)' }}
              >
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}