import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { Product } from "./products";

type DbProduct = Prisma.ProductGetPayload<{ include: { category: true } }>;

function toProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: Number(p.price),
    image: p.image ?? undefined,
    images: p.image ? [p.image] : [],
    description: p.description ?? undefined,
    
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getProductByIdFromDb(
  id: string,
): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: { category: true },
  });
  return row ? toProduct(row) : undefined;
}

export async function getRelatedProducts(
  id: string,
  limit = 4,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, id: { not: id } },
    include: { category: true },
    take: limit,
  });
  return rows.map(toProduct);
}

export async function getCategoryNames(): Promise<string[]> {
  const rows = await prisma.category.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((c) => c.name);
}
