import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ===== POST: reset link eka email ekata yawanna =====
export async function POST(request: Request) {
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

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      // Hama user ta token ekak witharai: kalin ewa ain karala aluth ekak
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + EXPIRY_MS),
          },
        }),
      ]);

      const base = process.env.APP_URL ?? "http://localhost:3000";
      const link = `${base}/forgot-password?token=${token}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your Deora password",
          text: `Hi ${user.name},\n\nUse this link to set a new password (valid for 1 hour):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
          html: `<p>Hi ${user.name},</p><p>Use this link to set a new password (valid for 1 hour):</p><p><a href="${link}">Reset password</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
        });
      } catch (err) {
        // Email fail unath user ta kiyanne na (account thiyenawada kiyala hint ekak wenawa)
        console.error("Reset email failed:", err);
      }
    }

    // Account thiyenawa nathnam kiyanne na: hama welawema same message
    return NextResponse.json({
      message:
        "If an account exists for that email, we have sent a reset link.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// ===== PUT: link eken aluth password eka set karanna =====
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!token) {
      return NextResponse.json(
        { message: "Invalid reset link" },
        { status: 400 },
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Password eka maru karala token eka delete karanawa (link eka ekapaarak witharai)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("PUT /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
