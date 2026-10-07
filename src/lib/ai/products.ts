import products from "../../../data/products-for-ai.json";

type AIProduct = {
  name: string;
  category?: string;
  price?: number;
  description?: string;
  ingredients?: string;
  usage?: string;
  stockStatus?: string;
};

let cached: string | null = null;

function stockText(status?: string) {
  if (status === "in_stock") return "in stock";
  if (status === "out_of_stock") return "out of stock";
  return status ? status.replace(/_/g, " ") : undefined;
}

export function getProductContext(): string {
  if (cached) return cached;

  const result = (products as AIProduct[])
    .map((p) =>
      [
        `Name: ${p.name}`,
        p.category && `Category: ${p.category}`,
        p.price != null && `Price: Rs. ${p.price}`,
        p.description && `About: ${p.description.slice(0, 250)}`,
        p.ingredients && `Ingredients: ${p.ingredients}`,
        p.usage && `How to use: ${p.usage.trim()}`,
        stockText(p.stockStatus) && `Stock: ${stockText(p.stockStatus)}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  cached = result;
  return result;
}