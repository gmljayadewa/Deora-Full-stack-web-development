import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken, sendVerificationEmail } from "@/lib/email-verification";
import { rateLimit } from "@/lib/rate-limit";

// ===== POST: link එකෙන් එන token එක verify කරනවා =====
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    if (!token) {
      return NextResponse.json(
        { message: "Invalid verification link" },
        { status: 400 },
      );
    }

    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        {
          message:
            "This verification link is invalid or has expired. If you already verified, please log in.",
        },
        { status: 400 },
      );
    }

    // Verified කරනවා, token එක මකනවා (link එක එක පාරයි)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: record.userId },
      }),
    ]);

    return NextResponse.json({ message: "Email verified" });
  } catch (error) {
    console.error("POST /api/auth/verify-email error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// ===== PUT: verification email එක ආයෙත් යවනවා =====
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // එකම email එකට විනාඩි 10කට පාර 3යි (spam නවත්තන්න)
    if (!rateLimit(`resend:${email}`, 3, 10 * 60_000)) {
      return NextResponse.json(
        { message: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      try {
        await sendVerificationEmail(user);
      } catch (err) {
        console.error("Resend verification failed:", err);
      }
    }

    // Account එකක් තියෙනවද නැද්ද කියලා හෙළි නොකරන්න, හැමවෙලේම එකම පණිවිඩය
    return NextResponse.json({
      message:
        "If an unverified account exists for that email, we have sent a new link.",
    });
  } catch (error) {
    console.error("PUT /api/auth/verify-email error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
