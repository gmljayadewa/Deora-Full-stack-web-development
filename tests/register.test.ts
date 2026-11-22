import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hash: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: mocks.hash },
}));

vi.mock("@/lib/email-verification", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
}));

import { POST } from "../src/app/api/auth/register/route";

function register(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "Password123!",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUnique.mockResolvedValue(null);
  mocks.hash.mockResolvedValue("hashed-password");
  mocks.create.mockResolvedValue({
    id: "user-1",
    name: validUser.name,
    email: validUser.email,
  });
  mocks.sendVerificationEmail.mockResolvedValue(undefined);
});

describe("Registration security", () => {
  it("creates a new user with a hashed password", async () => {
    const response = await register(validUser);

    expect(response.status).toBe(201);
    expect(mocks.hash).toHaveBeenCalledWith("Password123!", 10);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        name: validUser.name,
        email: validUser.email,
        password: "hashed-password",
        phone: null,
      },
    });
  });

  it("rejects an existing unverified account without changing its password", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "existing-user",
      emailVerified: null,
    });

    const response = await register(validUser);

    expect(response.status).toBe(409);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.hash).not.toHaveBeenCalled();
  });

  it("rejects an existing verified account", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "existing-user",
      emailVerified: new Date(),
    });

    const response = await register(validUser);

    expect(response.status).toBe(409);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects invalid email addresses", async () => {
    const response = await register({
      ...validUser,
      email: "invalid-email",
    });

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const response = await register({
      ...validUser,
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 409 for a duplicate email database constraint", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });

    const response = await register(validUser);

    expect(response.status).toBe(409);
  });

  it("does not fail registration when verification email sending fails", async () => {
    mocks.sendVerificationEmail.mockRejectedValue(
      new Error("Email service unavailable"),
    );

    const response = await register(validUser);

    expect(response.status).toBe(201);
  });
});
