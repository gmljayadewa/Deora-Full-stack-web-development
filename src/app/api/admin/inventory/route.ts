import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

// F01 cleanup: me file eke tibba local requireAdmin() eka hari (DB role
// check karala tibba), eth eka copy-paste kara code ekak unu. Dan
// /src/lib/require-admin.ts eke SHARED version ekama use karanawa — eka
// nisa pasuwa fix ekak one unoth, ONE place ekak witharak edit kale madi.

export async function GET() {
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        isActive: true,
        category: { select: { name: true } },
        inventory: { select: { quantity: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        stock: product.inventory?.quantity ?? 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/inventory:", error);

    return NextResponse.json(
      { message: "Failed to load inventory" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("productId" in body) ||
      !("quantity" in body) ||
      typeof body.productId !== "string" ||
      typeof body.quantity !== "number" ||
      !Number.isSafeInteger(body.quantity) ||
      body.quantity < 0 ||
      body.quantity > 1_000_000
    ) {
      return NextResponse.json(
        {
          message:
            "Provide a valid productId and stock quantity (0–1,000,000).",
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const inventory = await prisma.inventory.upsert({
      where: { productId: body.productId },
      create: {
        productId: body.productId,
        quantity: body.quantity,
      },
      update: { quantity: body.quantity },
    });

    return NextResponse.json({
      message: "Stock updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("PATCH /api/admin/inventory:", error);

    return NextResponse.json(
      { message: "Failed to update stock" },
      { status: 500 },
    );
  }
}
