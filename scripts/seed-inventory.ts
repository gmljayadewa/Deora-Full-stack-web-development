import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "fs";


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// copy the prisma import/setup from your export script here

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  const existing = await prisma.inventory.findMany({ select: { productId: true } });
  const have = new Set(existing.map((i) => i.productId));

  const missing = products.filter((p) => !have.has(p.id));

  await prisma.inventory.createMany({
    data: missing.map((p) => ({
      productId: p.id,
      quantity: 20, // TEST VALUE. Replace with real stock later
    })),
  });

  console.log(`Created ${missing.length} inventory rows`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());