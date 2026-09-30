import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ProductForAI = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  ingredients: string;
  usage: string;
  stockStatus: "in_stock" | "out_of_stock";
};

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
    orderBy: { name: "asc" },
  });

  const shaped: ProductForAI[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: p.price.toNumber(),
    description: p.description,
    ingredients: p.ingredients,
    usage: p.usage,
    stockStatus:
      p.inventory && p.inventory.quantity > 0 ? "in_stock" : "out_of_stock",
  }));

  writeFileSync(
    "data/products-for-ai.json",
    JSON.stringify(shaped, null, 2),
    "utf-8"
  );

  console.log(`Exported ${shaped.length} products to data/products-for-ai.json`);
}

main()
  .catch((err) => {
    console.error("Export failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());