import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

// GET: public store walata active products witharai
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST: product ekak hadanawa (ADMIN witharai)
export async function POST(request: Request) {
  // F01 fix: "proxy eken ADMIN witharai" kiyala comment eka tibba — proxy.ts
  // eka hari widiyatama run wenawa, eth eke check eka token eke pana `role`
  // field eka witharak trust kala (database eke role eka pasuwa change
  // unath, token eka expire wenakan pana access eka tibenawa). Dan ADMIN
  // decision eka database eken ma check karana me check ekatama dila.
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const price = Number(body.price);
    const categoryId = String(body.categoryId ?? "");
    const stock = body.stock === undefined ? 0 : Number(body.stock);

    if (!name || name.length > 200) {
      return NextResponse.json(
        { message: "A valid name is required" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Price must be greater than 0" },
        { status: 400 },
      );
    }
    if (!categoryId) {
      return NextResponse.json(
        { message: "categoryId is required" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
      return NextResponse.json(
        { message: "Stock must be a whole number" },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 },
      );
    }

    // Nested create: product saha inventory row eka ekama atomic operation eke
    const newProduct = await prisma.product.create({
      data: {
        name,
        description:
          typeof body.description === "string" ? body.description : null,
        price,
        categoryId,
        image: typeof body.image === "string" ? body.image : null,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
        ingredients:
          typeof body.ingredients === "string" ? body.ingredients : "",
        usage: typeof body.usage === "string" ? body.usage : "",
        inventory: { create: { quantity: stock } },
      },
      include: { inventory: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
