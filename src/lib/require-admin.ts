import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

type AuthFailure = {
  error: string;
  status: number;
};

type AuthSuccess = {
  user: {
    id: string;
    role: string;
  };
};

export type AuthResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        error: "Unauthorized — please log in",
        status: 401,
      };
    }

    let decoded: unknown;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return {
        error: "Invalid or expired token",
        status: 401,
      };
    }

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded) ||
      typeof decoded.id !== "string" ||
      !decoded.id
    ) {
      return {
        error: "Invalid authentication token",
        status: 401,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return {
        error: "Unauthorized — please log in",
        status: 401,
      };
    }

    return { user };
  } catch (error) {
    console.error("Authentication service error:", error);

    return {
      error: "Authentication service temporarily unavailable",
      status: 503,
    };
  }
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth();

  if ("error" in result) return result;

  if (result.user.role !== "ADMIN") {
    return {
      error: "Forbidden — admin access required",
      status: 403,
    };
  }

  return result;
}

export function authErrorResponse(result: AuthResult) {
  if ("error" in result) {
    return NextResponse.json(
      { message: result.error },
      { status: result.status },
    );
  }

  return null;
}
