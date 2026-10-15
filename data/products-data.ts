export type SeedProduct = {
  name: string;
  category: string;
  image: string;
  description: string;
  ingredients: string;
  usage: string;
  price: number; // 0 = not priced yet, product will be inactive
};

const TODO = "TODO: confirm with client";

const capsule = (name: string, file: string, herb: string): SeedProduct => ({
  name: `${name} Capsules`,
  category: "Capsules",
  image: `/images/products/capsules/${file}.png`,
  description: `${herb} capsules, traditionally used as part of a daily wellness routine.`,
  ingredients: TODO,
  usage: TODO,
  price: 0,
});

const tea = (name: string, file: string, desc: string): SeedProduct => ({
  name,
  category: "Tea",
  image: `/images/products/tea/${file}.png`,
  description: desc,
  ingredients: TODO,
  usage: TODO,
  price: 0,
});

const spice = (name: string, file: string): SeedProduct => ({
  name,
  category: "Spices",
  image: `/images/products/spices/${file}.png`,
  description: `${name}, a Sri Lankan spice blend for everyday cooking.`,
  ingredients: TODO,
  usage: TODO,
  price: 0,
});

const nutrition = (name: string, file: string): SeedProduct => ({
  name,
  category: "Nutrition",
  image: `/images/products/nutrition/${file}.png`,
  description: `${name}, a traditional Sri Lankan nutrition product.`,
  ingredients: TODO,
  usage: TODO,
  price: 0,
});

export const products: SeedProduct[] = [
  // Capsules (12)
  capsule("Ashwagandha", "ashwagandha", "Ashwagandha"),
  capsule("Cinnamon", "cinnamon", "Cinnamon"),
  capsule("Curry Leaves", "curry-leaves", "Curry leaves"),
  capsule("Gotukola", "gotukola", "Gotukola"),
  capsule("Heenbovitiya", "heenbovitiya", "Heenbovitiya"),
  capsule("Karavila", "karavila", "Karavila (bitter gourd)"),
  capsule("Keselmuwa", "keselmuwa", "Keselmuwa"),
  capsule("Lunuwila", "lunuwila", "Lunuwila"),
  capsule("Moringa", "moringa", "Moringa"),
  capsule("Niwithi", "niwithi", "Niwithi"),
  capsule("Thripala", "thripala", "Thripala"),
  capsule("Turmeric", "turmeric", "Turmeric"),

  // Tea (5)
  tea(
    "Amla Tea",
    "amla",
    "Amla herbal tea, traditionally enjoyed as a daily drink.",
  ),
  tea(
    "Cinnamon Tea",
    "cinnamon",
    "Cinnamon herbal tea with a warm, natural flavour.",
  ),
  tea(
    "Ginger Coriander Tea",
    "ginger-coriander",
    "Ginger and coriander herbal tea, a traditional Sri Lankan drink.",
  ),
  tea(
    "Heenbovitiya Tea",
    "heenbovitiya",
    "Heenbovitiya herbal tea, traditionally enjoyed as a daily drink.",
  ),
  tea(
    "Lotus Tea",
    "lotus-tea",
    "Lotus herbal tea with a light, soothing taste.",
  ),

  // Spices (7)
  spice("Chai Masala", "chai-masala"),
  spice("Curry Powder", "curry-powder"),
  spice("Fish Curry Powder", "fish-curry-powder"),
  spice("Maluambulthiyal Powder", "maluambulthiyal"),
  spice("Meat Curry Powder", "meat-curry-powder"),
  spice("Rasam Powder", "rasam"),
  spice("Roasted Curry Powder", "roasted-curry-powder"),

  // Nutrition (3)
  nutrition("Heenbovitiya Nutrition Mix", "heenbovitiya"),
  nutrition("Mix Porridge", "mix-porridge"),
  nutrition("Poshana Kenda", "poshana-kenda"),
];
