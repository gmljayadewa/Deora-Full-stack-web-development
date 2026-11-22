import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAuth();

  if ("error" in auth) {
    return NextResponse.json({ user: null }, { status: auth.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json({ user: null }, { status: 503 });
  }
}
