import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allowlist: body ekama Prisma ta denne na
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim())
      data.name = body.name.trim();
    if (typeof body.description === "string")
      data.description = body.description;
    if (typeof body.ingredients === "string")
      data.ingredients = body.ingredients;
    if (typeof body.usage === "string") data.usage = body.usage;
    if (typeof body.image === "string") data.image = body.image;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.categoryId === "string") data.categoryId = body.categoryId;
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ message: "Invalid price" }, { status: 400 });
      }
      data.price = price;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }

    // isActive: true condition eka ain kala, eka nisa inactive product ekak reactivate karanna puluwan
    const updatedProduct = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // ← Promise<> එකතු කරන්ඩ
) {
  try {
    const { id } = await params; // ← await කරන්ඩ

    await prisma.product.delete({
      where: { id, isActive: false },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
