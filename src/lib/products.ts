export type Product = {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
};

export const CATEGORIES = [
  "All",
  "Wellness",
  "Herbal Tea",
  "Kitchen Essentials",
  "Nutrition",
];

export const PRODUCTS: Product[] = [
  {
    id: "gotukola-capsules",
    name: "Gotukola Capsules",
    category: "Wellness",
    rating: 4.5,
    reviewCount: 128,
    price: 1200,
    image: "/images/products/capsules/gotukola.jpg",
    description:
      "Made from pure Gotukola leaf extract, these capsules support mental clarity, skin health and overall wellness. 100% natural, no artificial additives.",
  },
  {
    id: "moringa-Capsules",
    name: "Moringa Capsules",
    category: "Nutrition",
    rating: 4,
    reviewCount: 96,
    price: 950,
    image: "/images/products/capsules/moringa.jpg",
    description:
      "Nutrient-dense Moringa leaf powder, packed with vitamins and antioxidants. Add to smoothies, tea, or meals for a daily wellness boost.",
  },
  {
    id: "ceylon-cinnamon",
    name: "Ceylon Cinnamon Capsules",
    category: "Wellness",
    rating: 4.5,
    reviewCount: 78,
    price: 650,
    image: "/images/products/capsules/cinnamon.jpg",
    description:
      "Authentic Ceylon cinnamon sticks, hand-picked and sun-dried. Sweeter and milder than regular cinnamon, perfect for cooking and baking.",
  },
  {
    id: "Keselmuwa-Capsules",
    name: "Keselmuwa Capsules",
    category: "Wellness",
    rating: 4.5,
    reviewCount: 64,
    price: 750,
    image: "/images/products/capsules/keselmuwa.jpg",
    description:
      "Pure, high-curcumin turmeric powder sourced from local farms. Ideal for cooking and natural wellness remedies.",
  },

  {
    id: "herbal-lotus-tea",
    name: "Herbal Lotus Tea",
    category: "Herbal Tea",
    rating: 4.5,
    reviewCount: 45,
    price: 850,
    image: "/images/products/tea/lotus-tea.jpg",
    description:
      "A soothing blend of natural herbs designed to support gentle detoxification. Caffeine-free and naturally refreshing.",
  },
  {
    id: "moringa-capsules",
    name: "Deora Moringa Capsules",
    category: "Wellness",
    rating: 4.5,
    reviewCount: 128,
    price: 1500,
    image: "/images/products/capsules/moringa.jpg",
    description:
      "Deora Moringa Capsules made from premium moringa leaves, supporting energy and immunity.",
  },

  {
    id: "turmeric-capsules",
    name: "Deora Turmeric Capsules",
    category: "Wellness",
    rating: 4,
    reviewCount: 110,
    price: 1000,
    image: "/images/products/capsules/turmeric.jpg",
    description:
      "High-curcumin turmeric capsules for natural anti-inflammatory support.",
  },
  {
    id: "heenbovitiya-leaves",
    name: "Deora Heenbovitiya Capsules",
    category: "Wellness",
    rating: 4.5,
    reviewCount: 64,
    price: 950,
    image: "/images/products/capsules/heenbovitiya.jpg",
    description:
      "Traditional Heenbovitiya leaves known for supporting liver health and natural detox.",
  },
  {
    id: "ginger-coriander-tea",
    name: "Ginger Coriander Herbal Tea",
    category: "Herbal Tea",
    rating: 4.5,
    reviewCount: 78,
    price: 850,
    image: "/images/products/tea/ginger-coriander.jpg",
    description:
      "A warming blend of ginger and coriander, naturally caffeine-free.",
  },

  {
    id: "Niwithi Capsules",
    name: "Niwithi Capsules",
    category: "Wellness",
    rating: 4,
    reviewCount: 41,
    price: 700,
    image: "/images/products/capsules/niwithi.jpg",
    description: "Niwithi capsules, a traditional remedy for natural wellness.",
  },
  {
    id: "curry-powder",
    name: "Curry Powder",
    category: "Kitchen Essentials",
    rating: 4,
    reviewCount: 85,
    price: 650,
    image: "/images/products/spices/curry-powder.jpg",
    description: "A traditional Sri Lankan spice blend for authentic curries.",
  },
  {
    id: "Meat-curry-powder",
    name: "Meat Curry Powder",
    category: "Kitchen Essentials",
    rating: 4.5,
    reviewCount: 73,
    price: 550,
    image: "/images/products/spices/meat-curry-powder.jpg",
    description:
      "Meat Curry powder, freshly ground from locally sourced Meat Curry ingredients.",
  },
  {
    id: "Roasted-Curry-powder",
    name: "Roasted Curry Powder",
    category: "Kitchen Essentials",
    rating: 4,
    reviewCount: 39,
    price: 600,
    image: "/images/products/spices/roasted-curry-powder.jpg",
    description:
      "Roasted curry powder with a rich, smoky flavor for everyday cooking.",
  },
  {
    id: "poshana-kenda-mix",
    name: "Poshana Kenda Mix",
    category: "Nutrition",
    rating: 4.5,
    reviewCount: 92,
    price: 1200,
    image: "/images/products/nutrition/poshana-kenda.jpg",
    description:
      "A nutritious traditional porridge mix, rich in grains and natural goodness.",
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
