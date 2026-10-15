import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.product.findMany({
    include: { category: true, inventory: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  console.table(
    rows.map((p) => ({
      name: p.name,
      category: p.category.name,
      price: Number(p.price),
      active: p.isActive,
      stock: p.inventory?.quantity ?? 0,
    })),
  );
  console.log(
    `Total: ${rows.length}, active: ${rows.filter((r) => r.isActive).length}`,
  );
}

main().finally(() => prisma.$disconnect());
