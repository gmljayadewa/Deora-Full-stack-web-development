import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized — please log in" },
        { status: 401 },
      );
    }

    let decoded: { id: string; role: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden — admin access required" },
        { status: 403 },
      );
    }

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
