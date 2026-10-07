import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, ChevronRight } from 'lucide-react';
import { PRODUCTS, getProductById } from '../../../lib/products';
import ProductCard from '../../../components/ProductCard';
import ProductQuantitySelector from '../../../components/ProductQuantitySelector';
import ProductImageGallery from '../../../components/ProductImageGallery';

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}.00`;
}

type Params = Promise<{ id: string }>;

export default async function ProductDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop">Shop</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-ink)' }}>{product.name}</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductImageGallery images={galleryImages} productName={product.name} />

        <div>
          {product.category && (
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-brand)' }}
            >
              {product.category}
            </span>
          )}

          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-1">
            <Star size={14} fill="var(--color-secondary)" style={{ color: 'var(--color-secondary)' }} />
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <ProductQuantitySelector product={product} />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
            You May Also Like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}