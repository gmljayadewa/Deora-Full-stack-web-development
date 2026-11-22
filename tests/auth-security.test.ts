import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  verify: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: mocks.verify,
  },
}));

import { requireAuth, requireAdmin } from "../src/lib/require-admin";

beforeEach(() => {
  vi.clearAllMocks();

  process.env.JWT_SECRET = "test-only-secret";

  mocks.cookies.mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "test-token" }),
  });

  mocks.verify.mockReturnValue({
    id: "user-1",
    role: "ADMIN",
    sessionVersion: 0,
  });

  mocks.findUnique.mockResolvedValue({
    id: "user-1",
    role: "ADMIN",
    sessionVersion: 0,
  });
});

describe("Authentication security", () => {
  it("rejects requests without a cookie", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("rejects invalid or expired JWTs", async () => {
    mocks.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("rejects JWTs without a valid user ID", async () => {
    mocks.verify.mockReturnValue({ role: "ADMIN" });

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("rejects deleted users", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
  });

  it("rejects a JWT after the user's session version changes", async () => {
    mocks.verify.mockReturnValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 0,
    });

    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 1,
    });

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
  });

  it("allows a JWT with the current session version", async () => {
    mocks.verify.mockReturnValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 2,
    });

    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 2,
    });

    const result = await requireAuth();

    expect(result).toEqual({
      user: {
        id: "user-1",
        role: "CUSTOMER",
        sessionVersion: 2,
      },
    });
  });

  it("rejects JWTs without a session version", async () => {
    mocks.verify.mockReturnValue({
      id: "user-1",
      role: "CUSTOMER",
    });

    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
    });

    const result = await requireAuth();

    expect(result).toMatchObject({ status: 401 });
  });

  it("rejects customers accessing admin routes", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 0,
    });

    const result = await requireAdmin();

    expect(result).toMatchObject({ status: 403 });
  });

  it("allows current administrators", async () => {
    const result = await requireAdmin();

    expect(result).toEqual({
      user: {
        id: "user-1",
        role: "ADMIN",
        sessionVersion: 0,
      },
    });
  });

  it("rejects admins whose database role was revoked", async () => {
    mocks.verify.mockReturnValue({
      id: "user-1",
      role: "ADMIN",
      sessionVersion: 0,
    });

    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
      sessionVersion: 0,
    });

    const result = await requireAdmin();

    expect(result).toMatchObject({ status: 403 });
  });

  it("returns 503 when the authentication database fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      mocks.findUnique.mockRejectedValue(new Error("Database unavailable"));

      const result = await requireAuth();

      expect(result).toMatchObject({ status: 503 });
    } finally {
      spy.mockRestore();
    }
  });
});
