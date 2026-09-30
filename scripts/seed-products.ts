import "dotenv/config";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Row = {
  name: string;
  category: string;
  description: string;
  ingredients: string;
  usage: string;
  price: number | string;
  image?: string;
  isActive: boolean | string;
};

async function main() {
  const wb = XLSX.readFile("data/deora_products.xlsx");
  const rows = XLSX.utils.sheet_to_json<Row>(wb.Sheets["products"]);

  // 1) Validate first. Stop if data is not ready.
  const problems: string[] = [];
  for (const r of rows) {
    if (!r.name) problems.push("Row without name");
    if (!Number(r.price)) problems.push(`${r.name}: price missing`);
    if (/fill in|specify/i.test(r.ingredients ?? ""))
      problems.push(`${r.name}: ingredients not real`);
    if (/as directed/i.test(r.usage ?? ""))
      problems.push(`${r.name}: usage not specific`);
    if (r.name === "Snacks") problems.push("Snacks placeholder row still exists");
  }
  if (problems.length) {
    console.error("Fix these first:\n" + problems.join("\n"));
    process.exit(1);
  }

  // 2) Insert or update each product
  for (const r of rows) {
    // find or create category by name
    let category = await prisma.category.findFirst({ where: { name: r.category } });
    if (!category) {
      category = await prisma.category.create({ data: { name: r.category } });
    }

    const data = {
      name: r.name,
      description: r.description,
      ingredients: r.ingredients,
      usage: r.usage,
      price: Number(r.price),
      image: r.image || null,
      isActive: String(r.isActive).toUpperCase() === "TRUE",
      categoryId: category.id,
    };

    const existing = await prisma.product.findFirst({ where: { name: r.name } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      const product = await prisma.product.create({ data });
      // stock starts at 0. You will set real stock later.
      await prisma.inventory.create({
        data: { productId: product.id, quantity: 0 },
      });
    }
  }
  console.log(`Done: ${rows.length} products processed`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());