import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

export async function GET() {
  // F01 fix: kalin methana token eke `role` field eka witharak check kara.
  // Eyin ADMIN kenek role eka pasuwa CUSTOMER kara dhamma nam, token eka
  // expire wenakan (days 7k) pana ADMIN access ekama tibuna. Dan database
  // eken ma current role eka check karanawa.
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch admin products" },
      { status: 500 },
    );
  }
}
