import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  transaction: vi.fn(),
  deleteMany: vi.fn(),
  update: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    passwordResetToken: {
      findUnique: mocks.findUnique,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hash,
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
  getRetryAfterSeconds: vi.fn(() => 60),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { PUT } from "../src/app/api/auth/forgot-password/route";

function resetPassword(token: string, newPassword = "NewPassword123!") {
  return PUT(
    new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    }),
  );
}

const validRecord = {
  id: "reset-1",
  userId: "user-1",
  tokenHash: "stored-token-hash",
  expiresAt: new Date(Date.now() + 60_000),
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.findUnique.mockResolvedValue(validRecord);
  mocks.hash.mockResolvedValue("new-hashed-password");
  mocks.deleteMany.mockResolvedValue({ count: 1 });
  mocks.update.mockResolvedValue({ id: "user-1" });

  mocks.transaction.mockImplementation(async (callback) => {
    return callback({
      passwordResetToken: {
        deleteMany: mocks.deleteMany,
      },
      user: {
        update: mocks.update,
      },
    });
  });
});

describe("Password reset security", () => {
  it("rejects missing reset tokens", async () => {
    const response = await resetPassword("");

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const response = await resetPassword("valid-token", "short");

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unknown reset tokens", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const response = await resetPassword("unknown-token");

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects expired reset tokens", async () => {
    mocks.findUnique.mockResolvedValue({
      ...validRecord,
      expiresAt: new Date(Date.now() - 60_000),
    });

    const response = await resetPassword("expired-token");

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("increments sessionVersion after successful reset", async () => {
    const response = await resetPassword("valid-token");

    expect(response.status).toBe(200);

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        password: "new-hashed-password",
        sessionVersion: { increment: 1 },
      },
    });

    expect(mocks.deleteMany).toHaveBeenCalledTimes(2);
  });

  it("rejects a reset token already consumed", async () => {
    mocks.deleteMany.mockResolvedValueOnce({ count: 0 });

    const response = await resetPassword("used-token");

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns an error when the transaction fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      mocks.update.mockRejectedValue(new Error("Database update failed"));

      const response = await resetPassword("valid-token");

      expect(response.status).toBe(500);
      expect(mocks.transaction).toHaveBeenCalled();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
