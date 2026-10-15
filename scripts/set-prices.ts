import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Put the real price in Rs. 0 = skip (keep the current price)
const prices: Record<string, number> = {
  // Capsules
  "Ashwagandha Capsules": 1200,
  "Cinnamon Capsules": 1320, // now 1027.82
  "Curry Leaves Capsules": 990,
  "Gotukola Capsules": 860,
  "Heenbovitiya Capsules": 990, // now 1005.86
  "Karavila Capsules": 1545,
  "Keselmuwa Capsules": 1130,
  "Lunuwila Capsules": 1130,
  "Moringa Capsules": 990,
  "Niwithi Capsules": 1130,
  "Thripala Capsules": 990,
  "Turmeric Capsules": 650,

  // Nutrition
  "Heenbovitiya Nutrition Mix": 990,
  "Mix Porridge": 860, // now 1043.5
  "Poshana Kenda": 650,

  // Spices
  "Chai Masala": 700,
  "Curry Powder": 180, // now 1052.91
  "Fish Curry Powder": 240, // now 1062.32
  "Maluambulthiyal Powder": 250,
  "Meat Curry Powder": 280, // now 1059.18
  "Rasam Powder": 300,
  "Roasted Curry Powder": 270, // now 1056.05

  // Tea
  "Amla Tea": 1100, // now 1015.27
  "Cinnamon Tea": 900, // now 1030.95
  "Ginger Coriander Tea": 860,
  "Heenbovitiya Tea": 790, // now 1002.73
  "Lotus Tea": 1320,
};

async function main() {
  for (const [name, price] of Object.entries(prices)) {
    if (price <= 0) {
      console.log(`Skipped (no price): ${name}`);
      continue;
    }
    const result = await prisma.product.updateMany({
      where: { name },
      data: { price, isActive: true },
    });
    console.log(`${name}: Rs. ${price} (${result.count} updated)`);
  }
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
