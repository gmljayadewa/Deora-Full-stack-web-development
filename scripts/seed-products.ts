import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { products } from "../data/products-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const isPlaceholder = (s: string) =>
  /todo|fill in|specify|as directed/i.test(s);

async function main() {
  let created = 0;
  let updated = 0;

  for (const p of products) {
    const category = await prisma.category.upsert({
      where: { name: p.category },
      update: {},
      create: { name: p.category },
    });

    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          image: p.image,
          categoryId: category.id,
          ...(isPlaceholder(existing.ingredients) && {
            ingredients: p.ingredients,
          }),
          ...(isPlaceholder(existing.usage) && { usage: p.usage }),
        },
      });
      updated++;
    } else {
      product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          ingredients: p.ingredients,
          usage: p.usage,
          price: p.price,
          image: p.image,
          isActive: p.price > 0,
          categoryId: category.id,
        },
      });
      created++;
    }

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, quantity: 0 },
    });
  }

  console.log(`Done. Created: ${created}, updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
