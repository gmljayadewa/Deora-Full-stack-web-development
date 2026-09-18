import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// "why jsonwebtoken?" — JWT (JSON Web Token) කියන්නෙ user info (id, role)
// encode කරලා, digitally sign කරපු string එකක්. Server එකට ඒක verify
// කරන්ඩ පුලුවන් (secret key එකෙන්), ඒත් client එකට එය tamper (edit) කරන්ඩ
// බෑ — sign කරද්දි use කරන secret key එක client ට කවදාවත් නොදෙන නිසා.

const JWT_SECRET = process.env.JWT_SECRET!;
// "why an env variable, not hardcoded?" — මේ secret key එකෙන් තමයි token
// verify කරන්නෙ. Code එකේම hardcode කළොත් (GitHub වගේ public repo එකකට
// push කළොත්), ඕනම කෙනෙක්ට fake tokens හදාගන්ඩ පුලුවන් වෙනවා.
// .env file එකේ දාලා, .gitignore එකෙන් git එකෙන් exclude කරන්ඩ ඕන.

export async function POST(request: Request) {
  try {
    // received the request data from the client
    const { email, password } = await request.json();

    // validation for the request data
    if (!email || !password) {
      return NextResponse.json(
        { message: "email and password are required!" },
        { status: 400 }
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
        { status: 401 }
      );
    }

    // compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ==============================
    // NEW: Create the JWT token
    // ==============================
    // "why put id and role INSIDE the token?" — Middleware/route handlers
    // ඊළඟ requests වලදි, DB එකට ආයෙත් query එකක් නොකර, token එකෙන්ම
    // "මේ කවුද, role මොකක්ද" කියලා ඉක්මනට දැනගන්ඩ පුලුවන් වෙන්ඩ.
    const token = jwt.sign(
      {
        id: existingUser.id,
        role: existingUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // "why expiry?" — token එක permanent නම්, කවදාහරි
      // leak උනොත් (browser history, logs), permanent access එකක් ලැබෙනවා.
      // Expiry එකකින් ඒ risk window එක limit කරනවා.
    );

    // successful login, return a successful response
    const response = NextResponse.json(
      { message: "Login successfully", user: { id: existingUser.id, role: existingUser.role } },
      { status: 200 }
    );

    // ==============================
    // NEW: Set the token as an httpOnly cookie
    // ==============================
    // "why httpOnly?" — JavaScript (document.cookie) එකෙන් මේ cookie එක
    // read කරන්ඩ බෑ . XSS attack එකකින් (malicious script එකක්
    // page එකට inject වුණොත්) token එක steal කරගන්ඩ බැරි වෙන්ඩ.
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // "why secure only in production?" — localhost එකේදි HTTPS නැති
      // නිසා, dev environment එකේදි secure:true දුන්නොත් cookie එකම
      // set වෙන්නෙ නෑ. Production එකේදි (real HTTPS domain එකක) ඕන.
      sameSite: "strict",
      // "why sameSite strict?" — CSRF attacks (වෙන site එකකින් ඔයාගේ
      // site එකට request එවීම) වළක්වගන්ඩ.
      maxAge: 60 * 60 * 24 * 7, // 7 days, seconds වලින් (token expiry එකටම match)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}