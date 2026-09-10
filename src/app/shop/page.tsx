'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../../lib/products';

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under Rs. 700', min: 0, max: 699 },
  { label: 'Rs. 700 - 1,000', min: 700, max: 1000 },
  { label: 'Rs. 1,000 - 1,500', min: 1000, max: 1500 },
  { label: 'Above Rs. 1,500', min: 1500, max: Infinity },
];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? 'All';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0].label);

  const filteredProducts = useMemo(() => {
    const priceRange = PRICE_RANGES.find((r) => r.label === selectedPriceRange) ?? PRICE_RANGES[0];

    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, selectedPriceRange]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        Shop
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        {filteredProducts.length} of {PRODUCTS.length} products
      </p>

      {/* Search + Filter bar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        <div
          className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2.5"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <Search size={18} style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full text-sm outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: 'var(--color-muted)' }} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price filter */}
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {(searchQuery || selectedCategory !== 'All' || selectedPriceRange !== 'All Prices') && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {searchQuery && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'rgba(27, 67, 50, 0.1)', color: 'var(--color-brand-dark)' }}
            >
              &quot;{searchQuery}&quot;
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'rgba(27, 67, 50, 0.1)', color: 'var(--color-brand-dark)' }}
            >
              {selectedCategory}
            </span>
          )}
          {selectedPriceRange !== 'All Prices' && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'rgba(27, 67, 50, 0.1)', color: 'var(--color-brand-dark)' }}
            >
              {selectedPriceRange}
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedPriceRange('All Prices');
            }}
            className="text-xs font-medium underline"
            style={{ color: 'var(--color-muted)' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            No products match your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}