import jwt from "jsonwebtoken";
import type { NextResponse } from "next/server";

const MAX_AGE = 60 * 60 * 24 * 7; // dawas 7k

const cookieOptions = {
  httpOnly: true, // browser JS walata token eka read karanna bae
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function setAuthCookie(
  res: NextResponse,
  user: { id: string; role: string },
) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: MAX_AGE },
  );
  res.cookies.set("token", token, { ...cookieOptions, maxAge: MAX_AGE });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set("token", "", { ...cookieOptions, maxAge: 0 });
}
