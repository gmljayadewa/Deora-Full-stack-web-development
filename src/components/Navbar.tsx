'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import { useCart } from '../context/CartContext';
import { NavLink } from '../../prisma.config';

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const activeHref = '/about'; // matches the wireframe (About Us shown bold) — swap for usePathname() later
  const { totalItems } = useCart();
  const cartCount = totalItems;

  function handleSearch(e: FormEvent): void {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--color-bg)' }}>
      <AnnouncementBar />

      {/* Main navbar */}
      <div className="border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-8 py-5 pl-3 pr-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
            <Image
              src="/deora-logo.jpeg"
              alt="Deora"
              width={170}
              height={48}
              priority
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          {/* Desktop: nav links + search (grows) + icons (right edge), all in one row so there's no dead space */}
          <div className="hidden flex-1 items-center gap-8 lg:flex">
            <nav className="flex shrink-0 items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === activeHref;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative whitespace-nowrap pb-1 text-base"
                    style={{
                      color: isActive ? 'var(--color-brand)' : 'var(--color-ink)',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    <span className="transition-colors duration-200 group-hover:text-[var(--color-brand)]">
                      {link.label}
                    </span>
                    <span
                      className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
                      style={{ background: 'var(--color-brand)' }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Search bar - flex-1 grows to fill all remaining space between nav links and icons */}
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-center overflow-hidden rounded-full border px-5 py-2.5"
              style={{ borderColor: 'var(--color-line)' }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full text-base outline-none placeholder:text-[var(--color-muted)]"
              />
              <button type="submit" aria-label="Search">
                <Search size={18} style={{ color: 'var(--color-muted)' }} />
              </button>
            </form>

            {/* Icons - pinned to the far right edge */}
            <div className="flex shrink-0 items-center gap-5">
              <button
                aria-label="Account"
                className="flex flex-col items-center gap-0.5 text-[11px]"
                style={{ color: 'var(--color-ink)' }}
              >
                <User size={20} />
                Account
              </button>
              <button
                aria-label="Wishlist"
                className="flex flex-col items-center gap-0.5 text-[11px]"
                style={{ color: 'var(--color-ink)' }}
              >
                <Heart size={20} />
                Wishlist
              </button>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex flex-col items-center gap-0.5 text-[11px]"
                style={{ color: 'var(--color-ink)' }}
              >
                <ShoppingCart size={20} />
                Cart
                {cartCount > 0 && (
                  <span
                    className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: 'var(--color-brand)' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="ml-auto flex items-center gap-4 lg:hidden">
            <Link href="/cart" aria-label="Cart" className="relative" style={{ color: 'var(--color-ink)' }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: 'var(--color-brand)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              style={{ color: 'var(--color-ink)' }}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary empty strip (wireframe placeholder) - commented out to remove gap
      <div className="hidden h-8 md:block" style={{ background: 'var(--color-surface)' }} />
      */}

      {/* Mobile drawer */}
      {open && (
        <div className="border-b px-6 py-4 lg:hidden" style={{ borderColor: 'var(--color-line)', background: 'var(--color-bg)' }}>
          <form
            onSubmit={handleSearch}
            className="mb-4 flex items-center overflow-hidden rounded-full border px-4 py-2"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full text-sm outline-none placeholder:text-[var(--color-muted)]"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} style={{ color: 'var(--color-muted)' }} />
            </button>
          </form>

          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm"
                style={{
                  color: link.href === activeHref ? 'var(--color-brand)' : 'var(--color-ink)',
                  fontWeight: link.href === activeHref ? 700 : 500,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex gap-6 border-t pt-3" style={{ borderColor: 'var(--color-line)' }}>
            <button className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink)' }}>
              <User size={18} /> Account
            </button>
            <button className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink)' }}>
              <Heart size={18} /> Wishlist
            </button>
          </div>
        </div>
      )}
    </header>
  );
}