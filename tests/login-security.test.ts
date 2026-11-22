import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  compare: vi.fn(),
  setAuthCookie: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compare,
  },
}));

vi.mock("@/lib/auth-cookie", () => ({
  setAuthCookie: mocks.setAuthCookie,
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  getRetryAfterSeconds: vi.fn(() => 60),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { POST } from "../src/app/api/auth/login/route";

function login(body: unknown) {
  return POST(
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const validUser = {
  id: "user-1",
  email: "test@example.com",
  password: "hashed-password",
  role: "CUSTOMER",
  sessionVersion: 0,
  emailVerified: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.rateLimit.mockReturnValue(true);
  mocks.findUnique.mockResolvedValue(validUser);
  mocks.compare.mockResolvedValue(true);
});

describe("Login security", () => {
  it("creates an auth cookie for verified users", async () => {
    const response = await login({
      email: "TEST@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(mocks.setAuthCookie).toHaveBeenCalledWith(expect.anything(), {
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 0,
    });
  });

  it("rejects incorrect passwords", async () => {
    mocks.compare.mockResolvedValue(false);

    const response = await login({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(mocks.setAuthCookie).not.toHaveBeenCalled();
  });

  it("rejects unknown email addresses", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const response = await login({
      email: "unknown@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(401);
    expect(mocks.setAuthCookie).not.toHaveBeenCalled();
  });

  it("rejects unverified email accounts", async () => {
    mocks.findUnique.mockResolvedValue({
      ...validUser,
      emailVerified: null,
    });

    const response = await login({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(403);
    expect(mocks.setAuthCookie).not.toHaveBeenCalled();
  });

  it("rejects missing credentials", async () => {
    const response = await login({
      email: "",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(mocks.setAuthCookie).not.toHaveBeenCalled();
  });

  it("rejects invalid password types", async () => {
    const response = await login({
      email: "test@example.com",
      password: { unexpected: "object" },
    });

    expect(response.status).toBe(400);
    expect(mocks.compare).not.toHaveBeenCalled();
    expect(mocks.setAuthCookie).not.toHaveBeenCalled();
  });
});
