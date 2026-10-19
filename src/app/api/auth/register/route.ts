import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // String() + trim(): number / null wage deval awoth bypass wenne na
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const phone = String(body.phone ?? "").trim() || null;

    // Validation
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

    // Duplicate check for email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists!" },
        { status: 400 },
      );
    }

    // Password hashing (for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // role eka body eken ganne na: hamawelema CUSTOMER (schema default)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Ekama welawe dekak register unoth (unique email)
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
