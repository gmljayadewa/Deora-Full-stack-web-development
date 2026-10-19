import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getAuth(
  request: NextRequest,
): { id: string; role: string } | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    return { id: decoded.id, role: decoded.role };
  } catch {
    return null;
  }
}

/** Login wela inna user ge id eka. Login nathnam null. */
export function getUserId(request: NextRequest): string | null {
  return getAuth(request)?.id ?? null;
}
