export type Product = {
  id: string;
  name: string;
  category?: string;
  rating: number;
  reviewCount: number;
  price: number;
  image?: string;
  description?: string;
};

export const CATEGORIES = ['All', 'Wellness', 'Herbal Tea', 'Kitchen Essentials', 'Nutrition'];

export const PRODUCTS: Product[] = [
  {
    id: 'gotukola-capsules',
    name: 'Gotukola Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 128,
    price: 1200,
    image: '/images/products/gotukola-capsules.png',
    description: 'Made from pure Gotukola leaf extract, these capsules support mental clarity, skin health and overall wellness. 100% natural, no artificial additives.',
  },

  {
    id: 'moringa-Capsules',
    name: 'Moringa Capsules',
    category: 'Nutrition',
    rating: 4,
    reviewCount: 96,
    price: 950,
    image: '/images/products/moringa.png',
    description: 'Nutrient-dense Moringa leaf powder, packed with vitamins and antioxidants. Add to smoothies, tea, or meals for a daily wellness boost.',
  },

  {
    id: 'ceylon-cinnamon',
    name: 'Ceylon Cinnamon Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 78,
    price: 650,
    image: '/images/products/ceylon-cinnamon.png',
    description: 'Authentic Ceylon cinnamon sticks, hand-picked and sun-dried. Sweeter and milder than regular cinnamon, perfect for cooking and baking.',
  },

  {
    id: 'Keselmuwa-Capsules',
    name: 'Keselmuwa Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 64,
    price: 750,
    image: '/images/products/Keselmuwa.png',
    description: 'Pure, high-curcumin turmeric powder sourced from local farms. Ideal for cooking and natural wellness remedies.',
  },

  {
    id: 'neem-capsules',
    name: 'Neem Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 53,
    price: 1100,
    image: '/images/products/neem-capsules.png',
    description: 'Neem leaf capsules known for their natural detoxifying and skin-supporting properties. Sustainably sourced and lab-tested.',
  },

  {
    id: 'herbal-tea-detox',
    name: 'Herbal Tea - Detox',
    category: 'Herbal Tea',
    rating: 4.5,
    reviewCount: 45,
    price: 850,
    image: '/images/products/herbal-tea-detox.png',
    description: 'A soothing blend of natural herbs designed to support gentle detoxification. Caffeine-free and naturally refreshing.',
  },

  {
    id: 'herbal-lotus-tea',
    name: 'Herbal Lotus Tea',
    category: 'Herbal Tea',
    rating: 4.5,
    reviewCount: 45,
    price: 850,
    image: '/images/products/lotustea.png',
    description: 'A soothing blend of natural herbs designed to support gentle detoxification. Caffeine-free and naturally refreshing.',
  },

  {
    id: 'moringa-capsules',
    name: 'Deora Moringa Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 128,
    price: 1500,
     image: '/images/products/moringa.png',
    description: 'Deora Moringa Capsules made from premium moringa leaves, supporting energy and immunity.',
  },

  {
    id: 'beetroot-capsules',
    name: 'Deora Beetroot with Vitamin C Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 96,
    price: 1800,
    image: '/images/products/beetroot.png',
    description: 'Beetroot capsules to support healthy blood flow and natural energy levels.',
  },

   {
    id: 'carrot-capsules',
    name: 'Deora Carrot with Vitamin C Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 96,
    price: 1800,
    image: '/images/products/carrot.png',
    description: 'Carrot capsules to support healthy vision and natural energy levels.',
  },

  {
    id: 'turmeric-capsules',
    name: 'Deora Turmeric Capsules',
    category: 'Wellness',
    rating: 4,
    reviewCount: 110,
    price: 1000,
    image: '/images/products/turmeric.png',
    description: 'High-curcumin turmeric capsules for natural anti-inflammatory support.',
  },

  {
    id: 'heenbovitiya-leaves',
    name: 'Deora Heenbovitiya Capsules',
    category: 'Wellness',
    rating: 4.5,
    reviewCount: 64,
    price: 950,
    image: '/images/products/heenbovitiya.png',
    description: 'Traditional Heenbovitiya leaves known for supporting liver health and natural detox.',
  },

  {
    id: 'ginger-coriander-tea',
    name: 'Ginger Coriander Herbal Tea',
    category: 'Herbal Tea',
    rating: 4.5,
    reviewCount: 78,
    price: 850,
    image: '/images/products/ginger-coriander-tea.png',
    description: 'A warming blend of ginger and coriander, naturally caffeine-free.',
  },

  {
    id: 'lemongrass-tea',
    name: 'Lemongrass Herbal Tea',
    category: 'Herbal Tea',
    rating: 4.5,
    reviewCount: 52,
    price: 750,
    image: '/images/products/lemongrass-tea.png',
    description: 'Refreshing lemongrass tea, naturally soothing and aromatic.',
  },

  {
    id: 'Niwithi Capsules',
    name: 'Niwithi Capsules',
    category: 'Wellness',
    rating: 4,
    reviewCount: 41,
    price: 700,
    image: '/images/products/niwithi.png',
    description: 'Niwithi capsules, a traditional remedy for natural wellness.',
  },

  {
    id: 'curry-powder',
    name: 'Curry Powder',
    category: 'Kitchen Essentials',
    rating: 4,
    reviewCount: 85,
    price: 650,
    image: '/images/products/curry-powder.png',
    description: 'A traditional Sri Lankan spice blend for authentic curries.',
  },

  {
    id: 'Meat-curry-powder',
    name: 'Meat Curry Powder',
    category: 'Kitchen Essentials',
    rating: 4.5,
    reviewCount: 73,
    price: 550,
    image: '/images/products/meat-curry-powder.png',
    description: 'Meat Curry powder, freshly ground from locally sourced Meat Curry ingredients.',
  },

  {
    id: 'Roasted-Curry-powder',
    name: 'Roasted Curry Powder',
    category: 'Kitchen Essentials',
    rating: 4,
    reviewCount: 39,
    price: 600,
    image: '/images/products/Roasted-Curry-Powder.png',
    description: 'Roasted curry powder with a rich, smoky flavor for everyday cooking.',
  },

  {
    id: 'poshana-kenda-mix',
    name: 'Poshana Kenda Mix',
    category: 'Nutrition',
    rating: 4.5,
    reviewCount: 92,
    price: 1200,
    image: '/images/products/poshana-kenda-mix.png',
    description: 'A nutritious traditional porridge mix, rich in grains and natural goodness.',
  },

  {
    id: 'moringa-leaf-powder',
    name: 'Moringa Leaf Powder',
    category: 'Nutrition',
    rating: 4.5,
    reviewCount: 58,
    price: 900,
    image: '/images/products/moringa-leaf-powder.png',
    description: 'Finely ground Moringa leaf powder for daily nutritional support.',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}