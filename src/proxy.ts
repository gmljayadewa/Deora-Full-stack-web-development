import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// "why a middleware file, not a check inside every route.ts?" — Products
// API එකේ PUT/DELETE, Users API එකේ GET all/DELETE වගේ, protect කරන්ඩ
// ඕන endpoints ගොඩක් තියෙනවා. හැම route.ts file එකකම same auth-check
// code එක copy-paste කරනවට වඩා, request එක route handler එකටම reach
// වෙන්ඩ කලින්ම middleware එකකින් check කරලා, block කරන්ඩ ඕන request
// ටික මුලින්ම නවත්තනවා (DRY principle — Don't Repeat Yourself).

export function proxy(request: NextRequest){
  const path = request.nextUrl.pathname;
  const method = request.method;

  // ==============================
  // STEP 1: මේ request එක protect කරන්ඩ ඕන path එකක්ද කියලා check කරනවා
  // ==============================
  // "why check path here instead of only using matcher config?" — matcher
  // (file එකේ අගට) කරන්නෙ "මේ middleware function එකම run කරනවද" කියන
  // coarse-grained check එක. Method-specific logic (GET එකට එක rule,
  // DELETE එකට වෙන rule) function එක ඇතුළෙම ලියන්ඩ ඕන.

  const isUsersRoute = path.startsWith("/api/users");
  const isProductsWriteRoute =
    path.startsWith("/api/products") && method !== "GET";
  // "why method !== GET here?" — Products list එක (GET) ඕනම කෙනෙක්ට
  // (logged-out කෙනෙක්ටත්) බලාගන්ඩ පුලුවන් වෙන්ඩ ඕන (public store page).
  // ඒත් POST/PUT/DELETE (create/update/delete product) admin-only.

  if (!isUsersRoute && !isProductsWriteRoute) {
    // protect කරන්ඩ ඕන route එකක් නෙවෙයි නම්, request එක සාමාන්‍ය පරිදි
    // ඉදිරියට යවනවා — කිසිම check එකක් කරන්ඩ ඕන නෑ.
    return NextResponse.next();
  }

  // ==============================
  // STEP 2: Cookie එකෙන් token එක ගන්නවා
  // ==============================
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // "why 401 here, not redirect?" — Page (browser) request එකක් නම්
    // login page එකට redirect කරන එක natural. ඒත් මේක API route එකක්,
    // frontend JS code එකෙන් fetch() කරන request එකක් — redirect එකක්
    // frontend එකට "302" status එකක් විදිහට එනවා, ඒක handle කරන්ඩ
    // අමාරු. API routes වලට JSON error + status code එකයි standard.
    return NextResponse.json(
      { message: "Unauthorized — please log in" },
      { status: 401 }
    );
  }

  // ==============================
  // STEP 3: Token එක verify කරලා, decode කරගන්නවා
  // ==============================
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    // "why try/catch here?" — token එක expired උනොත්, tampered
    // (edit කරලා) නම්, හෝ wrong secret එකකින් sign කරලා නම්,
    // jwt.verify() එකෙන් error එකක් throw වෙනවා.

    // ==============================
    // STEP 4: Role check කරනවා — protected route එකට ADMIN විතරයි
    // ==============================
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    // Authorized — request එක ඉදිරියට යවනවා.
    // "why pass user info forward?" — route handler එකට "request කරපු
    // කෙනාගේ id මොකක්ද" කියලා ඕන වෙන්ඩ පුලුවන් (e.g. audit log එකකට).
    // Header එකකට දාලා forward කරනවා.
    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.id);
    response.headers.set("x-user-role", decoded.role);
    return response;
    } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}   // ← ADD THIS — proxy function එකේ closing brace එක

// "why a matcher config?" — middleware.ts file එක default විදිහට
// **හැම request එකකටම** run වෙනවා (images, static files ඇතුළුව) —
// ඒක අනවශ්‍ය performance cost එකක්. matcher එකෙන් "මේ paths වලට
// විතරයි middleware run කරන්ඩ" කියලා limit කරනවා.
export const config = {
  matcher: ["/api/users/:path*", "/api/products/:path*"],
};

