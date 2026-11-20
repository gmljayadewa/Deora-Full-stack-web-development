import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// =====================================================================
// Note: me file eke nama "proxy.ts" widiyatama rakinawa — Next.js 16
// eke eka ma correct convention eka (Next.js 15 saha pahala "middleware.ts"
// kiyala tibba eka, 16 ekata "proxy.ts" + function name eka "proxy" widiyata
// rename kara). Project eke package.json eke next@16.3.1 use karana nisa,
// me file eka ETHANDAMA hari tibba (mata kalin wenas athi hithune —
// eya mage error ekak, sorry).
//
// F01 real fix eka (me file eke tibba eka) — methana tibba logic eka
// 403 (role != ADMIN) decision eka, token eke pana `role` field eka
// witharak check kala. Eka F01 eke main issue eka: database eke user
// ge role eka pasuwa (CUSTOMER ta) change unath, token eka expire
// wenakan (days 7k) pana ADMIN role ekama trust wela tibba.
//
// Eka fix karanna, ADMIN da kiyana authoritative decision eka dan
// route handler ekema (requireAdmin(), /src/lib/require-admin.ts)
// karanawa — eka database eken ma current role eka, HAMA request
// ekakmath, aluthen check karanawa. Methana proxy eke thiyenne FIRST,
// FAST layer ekak witharai: "token ekak thiyenawada, eka valid da"
// kiyala check kara, nathnam 401 ekak dala request eka ETHANIMA
// nawaththanawa (database query ekakwath karanna kalin).
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  const isUsersRoute = path.startsWith("/api/users");
  const isProductsWriteRoute =
    path.startsWith("/api/products") && method !== "GET";

  if (!isUsersRoute && !isProductsWriteRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized — please log in" },
      { status: 401 },
    );
  }

  try {
    // Methana check karanne token eka VALID da (signature eka hari da,
    // expire wela na da) kiyala witharai — ADMIN da kiyala NAHA. Eka
    // route handler eke requireAdmin() eken, database eken ma check
    // wenawa.
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/users/:path*", "/api/products/:path*"],
};
