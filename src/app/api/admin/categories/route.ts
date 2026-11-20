import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

export async function GET() {
  // F01 fix: database eken ma current role eka check karanawa (token
  // eke pana role field eka witharak trust karanne na).
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);

    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
