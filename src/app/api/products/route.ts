// make the API response JSON
import { NextResponse } from "next/server";
// database client
import { prisma } from "@/lib/prisma";

// GET: fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST: create a product
export async function POST(request: Request) {
  try {
    // Step 1: read the request body
    const body = await request.json();
    const { name, description, price, categoryId, image, isActive } = body;

    // Step 2: validation
    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { message: "name, price and categoryId are required" },
        { status: 400 },
      );
    }

    // Step 3: create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        image,
        isActive,
        ingredients: body.ingredients ?? "",
        usage: body.usage ?? "",
      },
    });

    // Step 4: return the new product
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
