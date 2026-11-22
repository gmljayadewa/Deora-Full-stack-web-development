import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

// GET /api/users - GET all users list (admin only)
export async function GET() {
  // "why check here too, src/proxy.ts eken check karanawa nane?" — proxy.ts
  // eka run wenawa (eka hari widiyatama setup kara), eth eke tibba check
  // eka token eke pana `role` field eka witharak trust kala (F01 issue —
  // database eke role eka pasuwa change unath, token eka expire wenakan
  // pana access eka tibenawa). Eka fix karanna dan proxy.ts eka "token
  // valid da" witharak check kara, ADMIN da kiyana authoritative decision
  // eka ME ROUTE EKATAMA (database eken ma current role check karala) dila
  // thiyenne.
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    // why select, not include: user table eken specific fields witharak
    // ganna one (password field eka exclude karanna).
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { message: "failed to fetch users" },
      { status: 500 },
    );
  }
}
