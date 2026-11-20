import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit, getRetryAfterSeconds, getClientIp } from "@/lib/rate-limit";

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

    // ==============================
    // F02 fix: rate limiting
    // ==============================
    // IP ekata saha email ekata dekatama limit — kenek repeated requests
    // ekama email ekata (email-bombing / inbox spam) nattam IP ekakin
    // godak email try karanawa (enumeration) deken ma mehema wala.
    const ip = getClientIp(request);
    const ipKey = `forgot-password:ip:${ip}`;
    const emailKey = `forgot-password:email:${email}`;

    // 5 requests / 15 minutes per IP, 3 requests / 15 minutes per email.
    const ipAllowed = rateLimit(ipKey, 5, 15 * 60_000);
    const emailAllowed = rateLimit(emailKey, 3, 15 * 60_000);

    if (!ipAllowed || !emailAllowed) {
      const retryAfter = Math.max(
        getRetryAfterSeconds(ipKey),
        getRetryAfterSeconds(emailKey),
      );
      // "why is this safe to say plainly, won't it leak account info?" —
      // na, me rate-limit check eka database eke user eka balanna KALIN
      // run wenawa — HAMA email ekatama (exist unath, nathath) ekama
      // check eka apply wenawa. Eka nisa "too many requests" kiyana eka
      // itself "me email eka exist wenawada" kiyala help karanne na.
      return NextResponse.json(
        { message: "Too many reset requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
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

    const tokenHash = hashToken(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // ==============================
    // F09 fix: race condition eka
    // ==============================
    // "mokada race condition ekak?" — kalin (උඩ code eke) check eka
    // (findUnique) ekak, pasuwa update eka weradi karala tibbe deyak.
    // Browser 2k eken (nattam attacker 1ak + real user 1ak) ekama link
    // eka ekasamana welawaka open karanoth, DEKAMA findUnique eke token
    // eka "valid" widiyata hambenawa (deken kisima ekak dan delete
    // karala na nisa) — ewayin DEKAMATA password reset karanna puluwan
    // wenawa, eka race condition ekak.
    //
    // "fix eka mokakda?" — password update karanna KALIN, token row eka
    // ma CONDITIONALLY delete karanawa ("id ekata saha tokenHash ekata
    // match wena row ekak dan ithuru welada?" kiyala check karala
    // witharak delete karanawa). Deken requests dekama athi welawaka
    // reach unath, Postgres eke row-level lock ekak nisa ONE ekaka
    // delete eka witharak "count: 1" widiyata success wenawa — anith
    // eka, eya run wena welawata row eka ALREADY delete wela ithin
    // "count: 0" widiyata fail wenawa. Eka Inventory service eke stock
    // deduct karana welawe use karana SAME pattern eka (conditional
    // update, "F08 - good implementation" kiyala audit eke kiyapu eka).
    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.passwordResetToken.deleteMany({
        where: {
          id: record.id,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (deleted.count !== 1) {
        // Already consumed by a concurrent request (nattam me athara
        // delete unath) — password update karanne na.
        return { consumed: false as const };
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      });

      // User ekata thibba wena reset tokens (thiyenawanam) ain karanawa.
      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId },
      });

      return { consumed: true as const };
    });

    if (!result.consumed) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("PUT /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
