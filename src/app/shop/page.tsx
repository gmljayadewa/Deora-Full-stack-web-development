import { Suspense } from 'react';
import ShopClient from './ShopClient';
import { getProducts, getCategoryNames } from '../../lib/product-queries';

export const dynamic = 'force-dynamic'; // always read fresh data from the DB

export default async function ShopPage() {
  const [products, categoryNames] = await Promise.all([getProducts(), getCategoryNames()]);

  return (
    <Suspense fallback={null}>
      <ShopClient products={products} categories={['All', ...categoryNames]} />
    </Suspense>
  );
}