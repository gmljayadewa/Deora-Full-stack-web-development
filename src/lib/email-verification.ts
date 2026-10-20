import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const EXPIRY_MS = 24 * 60 * 60 * 1000; // පැය 24

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Email එකට දාන නම HTML එකක් විදියට වැඩ නොකරන්න
export const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function sendVerificationEmail(user: {
  id: string;
  name: string;
  email: string;
}) {
  const token = crypto.randomBytes(32).toString("hex");

  // හැම user කෙනෙකුටම token එකක් විතරයි: පරණ ඒවා මකලා අලුත් එකක්
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EXPIRY_MS),
      },
    }),
  ]);

  const base = process.env.APP_URL ?? "http://localhost:3000";
  const link = `${base}/verify-email?token=${token}`;
  const name = escapeHtml(user.name);

  await sendEmail({
    to: user.email,
    subject: "Verify your Deora account",
    text: `Hi ${user.name},\n\nPlease verify your email to activate your account (valid for 24 hours):\n${link}\n\nIf you did not create this account, you can ignore this email.`,
    html: `<p>Hi ${name},</p><p>Please verify your email to activate your account (valid for 24 hours):</p><p><a href="${link}">Verify my email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
  });
}
