import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { products } from "../data/products-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const keep = products.map((p) => p.name);
  const extras = await prisma.product.findMany({
    where: { name: { notIn: keep } },
  });
  console.log(`Found ${extras.length} products not in the list`);

  for (const p of extras) {
    // cart items are temporary, safe to remove
    await prisma.cartItem.deleteMany({ where: { productId: p.id } });

    const orderCount = await prisma.orderItem.count({
      where: { productId: p.id },
    });

    if (orderCount > 0) {
      // used in past orders, so hide it instead of deleting
      await prisma.product.update({
        where: { id: p.id },
        data: { isActive: false },
      });
      console.log(`Deactivated (used in ${orderCount} orders): ${p.name}`);
    } else {
      await prisma.product.delete({ where: { id: p.id } }); // inventory cascades
      console.log(`Deleted: ${p.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
