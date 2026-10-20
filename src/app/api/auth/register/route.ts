import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email-verification";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const phone = String(body.phone ?? "").trim() || null;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required!" },
        { status: 400 },
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format!" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters!" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    // Verify කරපු account එකක් තියෙනවා නම් ආයෙත් register කරන්න බෑ
    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { message: "User with this email already exists!" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Verify කරලා නැති account එකක් තියෙනවා නම් අලුත් විස්තර වලින් update කරනවා
    // (වෙන කෙනෙක් ඔයාගේ email එක "අල්ලගන්න" බැරි වෙන්න)
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, password: hashedPassword, phone },
        })
      : await prisma.user.create({
          data: { name, email, password: hashedPassword, phone },
        });

    // Email යන්නේ නැති වුණත් account එක හැදෙනවා (user ට resend කරන්න පුළුවන්)
    try {
      await sendVerificationEmail(user);
    } catch (err) {
      console.error("Verification email failed:", err);
    }

    return NextResponse.json(
      {
        message:
          "Account created. Please check your email to verify your account.",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { message: "User with this email already exists!" },
        { status: 400 },
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
