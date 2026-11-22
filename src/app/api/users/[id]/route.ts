import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";

const USER_SAFE_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // F01 fix: proxy.ts eken check wenawa kiyala hithagena hitiyata, eka
  // middleware widiyata run wenne na. Ewa nisa methanama admin check eka.
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_FIELDS,
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// Update user by id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, address } = body;
    // role: "ADMIN" eka request body eken ganne na — mass-assignment
    // vulnerability ekakin (kenek "role":"ADMIN" danna try kalath) wela
    // gaththe na.

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, phone, address },
      select: USER_SAFE_FIELDS,
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 },
    );
  }
}

// Delete user by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  const errorResponse = authErrorResponse(auth);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
