import fs from "fs";
import path from "path";

type AIProduct = {
    name: string;
    category?: string;
    price?: string;
    description?: string;
    ingredients?: string;
    usage?: string;
    stockStatus?: string;
};

let cached: string | null = null;

function stockText(status?: string) {
    if (status === "in_stock") return "in stock";
    if (status === "out_of_stock") return "out of stock";
    return status?.replace(/_/g, " ");
}

export function getProductContext(): string{
    if (cached) return cached;

    const file =  path.join(process.cwd(), "data" , "products-for-ai.json");
    const products: AIProduct[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    
    const result = products
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

