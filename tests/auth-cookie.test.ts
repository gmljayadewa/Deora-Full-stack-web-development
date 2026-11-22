import { afterEach, beforeEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { setAuthCookie, clearAuthCookie } from "../src/lib/auth-cookie";

const originalSecret = process.env.JWT_SECRET;

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret-for-auth-cookie-tests";
});

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});

describe("Authentication cookie security", () => {
  it("creates a signed JWT containing user identity", () => {
    const response = NextResponse.json({ ok: true });

    setAuthCookie(response, {
      id: "user-123",
      role: "CUSTOMER",
    });

    const token = response.cookies.get("token")?.value;

    expect(token).toBeTruthy();

    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    expect(decoded.id).toBe("user-123");
    expect(decoded.role).toBe("CUSTOMER");
  });

  it("sets JWT expiration to seven days", () => {
    const response = NextResponse.json({ ok: true });

    setAuthCookie(response, {
      id: "user-123",
      role: "CUSTOMER",
    });

    const token = response.cookies.get("token")?.value;

    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    expect(decoded.exp! - decoded.iat!).toBe(60 * 60 * 24 * 7);
  });

  it("sets secure cookie attributes", () => {
    const response = NextResponse.json({ ok: true });

    setAuthCookie(response, {
      id: "user-123",
      role: "CUSTOMER",
    });

    const cookie = response.cookies.get("token");

    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("strict");
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 7);
    expect(cookie?.secure).toBe(process.env.NODE_ENV === "production");
  });

  it("clears the authentication cookie on logout", () => {
    const response = NextResponse.json({ ok: true });

    clearAuthCookie(response);

    const cookie = response.cookies.get("token");

    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
    expect(cookie?.path).toBe("/");
  });

  it("rejects a tampered JWT", () => {
    const response = NextResponse.json({ ok: true });

    setAuthCookie(response, {
      id: "user-123",
      role: "CUSTOMER",
    });

    const token = response.cookies.get("token")!.value;
    const parts = token.split(".");

    // Change the signature without changing the payload.
    const signature = parts[2];
    const replacement = signature[0] === "a" ? "b" : "a";

    parts[2] = replacement + signature.slice(1);

    const tamperedToken = parts.join(".");

    expect(() => jwt.verify(tamperedToken, process.env.JWT_SECRET!)).toThrow();
  });
});
