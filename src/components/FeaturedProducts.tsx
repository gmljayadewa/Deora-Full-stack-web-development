import { unstable_noStore as noStore } from 'next/cache';
import FeaturedProductsClient from './FeaturedProductsClient';
import { getProducts } from '../lib/product-queries';

export default async function FeaturedProducts() {
  noStore(); // always read fresh data from the DB
  const products = await getProducts();

  if (products.length === 0) return null;

  return <FeaturedProductsClient products={products.slice(0, 12)} />;
}