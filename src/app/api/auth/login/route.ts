import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth-cookie";
import { rateLimit, getRetryAfterSeconds, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // received the request data from the client
    const { email: rawEmail, password } = await request.json();
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    // validation for the request data
    if (!email || typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { message: "email and password are required!" },
        { status: 400 },
      );
    }

    const ip = getClientIp(request);
    const ipKey = `login:ip:${ip}`;
    const emailKey = `login:email:${email}`;

    const ipAllowed = rateLimit(ipKey, 10, 10 * 60_000);
    const emailAllowed = rateLimit(emailKey, 5, 10 * 60_000);

    if (!ipAllowed || !emailAllowed) {
      const retryAfter = Math.max(
        getRetryAfterSeconds(ipKey),
        getRetryAfterSeconds(emailKey),
      );
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    // find the user in the database by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // if user does not exist, return an error response
    if (!existingUser) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Email එක verify කරලා නැත්නම් login වෙන්න දෙන්නේ නෑ
    // (password හරි උනාට පස්සේ විතරයි බලන්නේ, එතකොට වෙන කෙනෙක්ට "මේ email එක register වෙලා" කියලා දැනගන්න බෑ)
    if (!existingUser.emailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email before logging in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 },
      );
    }

    // Create the successful login response
    const response = NextResponse.json(
      {
        message: "Login successfully",
        user: {
          id: existingUser.id,
          role: existingUser.role,
        },
      },
      { status: 200 },
    );

    // Sign the JWT and set the secure authentication cookie
    // using the shared helper.
    setAuthCookie(response, {
      id: existingUser.id,
      role: existingUser.role,
      sessionVersion: existingUser.sessionVersion,
    });

    return response;
  } catch (error) {
    console.error("login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
