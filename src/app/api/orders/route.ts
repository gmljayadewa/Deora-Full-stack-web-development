import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma, TX_OPTIONS } from "@/lib/prisma";
import {
  requireAuth,
  requireAdmin,
  authErrorResponse,
} from "@/lib/require-admin";
import { DELIVERY_FEE } from "@/lib/shipping";
import { decrementStock, OutOfStockError } from "@/services/inventory.service";

const METHOD_MAP = {
  COD: "CASH_ON_DELIVERY",
  BANK: "BANK_TRANSFER",
  WHATSAPP: "WHATSAPP",
} as const;

const MAX_LINES = 50;
const MAX_QTY = 99;
const MAX_BODY_BYTES = 32 * 1024;

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type OrderPayload = {
  paymentMethod: keyof typeof METHOD_MAP;
  shippingAddress: string;
  customerName: string | null;
  phone: string | null;
  note: string | null;
  items: OrderItemInput[];
};

type SavedOrder = {
  id: string;
  totalAmount: Prisma.Decimal;
  idempotencyHash: string | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function optionalText(
  value: unknown,
  maxLength: number,
): string | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    return undefined;
  }

  return trimmed || null;
}

function validatePayload(
  body: unknown,
): { ok: true; payload: OrderPayload } | { ok: false; message: string } {
  if (!isRecord(body)) {
    return {
      ok: false,
      message: "Invalid request body",
    };
  }

  if (
    typeof body.paymentMethod !== "string" ||
    !Object.prototype.hasOwnProperty.call(METHOD_MAP, body.paymentMethod)
  ) {
    return {
      ok: false,
      message: "Invalid payment method",
    };
  }

  if (
    typeof body.shippingAddress !== "string" ||
    !body.shippingAddress.trim() ||
    body.shippingAddress.length > 2000
  ) {
    return {
      ok: false,
      message: "Invalid shipping address",
    };
  }

  const customerName = optionalText(body.customerName, 200);
  const phone = optionalText(body.phone, 50);
  const note = optionalText(body.note, 2000);

  if (customerName === undefined || phone === undefined || note === undefined) {
    return {
      ok: false,
      message: "Invalid customer details",
    };
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > MAX_LINES
  ) {
    return {
      ok: false,
      message: "Invalid order items",
    };
  }

  const wanted = new Map<string, number>();

  for (const line of body.items) {
    if (!isRecord(line)) {
      return {
        ok: false,
        message: "Invalid cart item",
      };
    }

    const { productId, quantity } = line;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QTY
    ) {
      return {
        ok: false,
        message: "Invalid cart item",
      };
    }

    const combined = (wanted.get(productId) ?? 0) + quantity;

    if (combined > MAX_QTY) {
      return {
        ok: false,
        message: "Quantity limit exceeded",
      };
    }

    wanted.set(productId, combined);
  }

  const items = [...wanted.entries()]
    .map(([productId, quantity]) => ({
      productId,
      quantity,
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  return {
    ok: true,
    payload: {
      paymentMethod: body.paymentMethod as keyof typeof METHOD_MAP,
      shippingAddress: body.shippingAddress.trim(),
      customerName,
      phone,
      note,
      items,
    },
  };
}

function existingOrderResponse(order: SavedOrder, expectedHash: string) {
  if (order.idempotencyHash !== expectedHash) {
    return jsonError(
      "Idempotency key reused with different order details",
      409,
    );
  }

  return NextResponse.json({
    orderId: order.id,
    total: Number(order.totalAmount),
    duplicate: true,
  });
}

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            method: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return jsonError("Failed to load orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    if ("error" in auth) {
      return jsonError(auth.error, auth.status);
    }

    const userId = auth.user.id;

    const key = request.headers.get("Idempotency-Key");

    if (!key || key.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(key)) {
      return jsonError("Invalid Idempotency-Key", 400);
    }

    const contentLength = request.headers.get("content-length");

    if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) {
      return jsonError("Request body too large", 413);
    }

    let body: unknown;

    try {
      const raw = await request.text();

      if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
        return jsonError("Request body too large", 413);
      }

      body = JSON.parse(raw);
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const validation = validatePayload(body);

    if (!validation.ok) {
      return jsonError(validation.message, 400);
    }

    const payload = validation.payload;
    const method = METHOD_MAP[payload.paymentMethod];

    const requestHash = fingerprint({
      userId,
      method,
      shippingAddress: payload.shippingAddress,
      customerName: payload.customerName,
      phone: payload.phone,
      note: payload.note,
      items: payload.items,
    });

    const lookup = {
      userId_idempotencyKey: {
        userId,
        idempotencyKey: key,
      },
    };

    const existing = await prisma.order.findUnique({
      where: lookup,
    });

    if (existing) {
      return existingOrderResponse(existing, requestHash);
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: payload.items.map((item) => item.productId),
        },
      },
    });

    if (products.length !== payload.items.length) {
      return jsonError("Product not found", 400);
    }

    if (products.some((product) => !product.isActive)) {
      return jsonError("Product unavailable", 400);
    }

    const quantities = new Map(
      payload.items.map((item) => [item.productId, item.quantity]),
    );

    const lines = products
      .map((product) => ({
        product,
        quantity: quantities.get(product.id)!,
      }))
      .sort((a, b) => a.product.id.localeCompare(b.product.id));

    const itemsTotal = lines.reduce(
      (sum, line) => sum + Number(line.product.price) * line.quantity,
      0,
    );

    const totalAmount = itemsTotal + DELIVERY_FEE;

    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const line of lines) {
          await decrementStock(
            tx,
            line.product.id,
            line.quantity,
            line.product.name,
          );
        }

        return tx.order.create({
          data: {
            userId,
            idempotencyKey: key,
            idempotencyHash: requestHash,
            customerName: payload.customerName,
            phone: payload.phone,
            note: payload.note,
            totalAmount,
            shippingAddress: payload.shippingAddress,
            status: "PENDING",
            items: {
              create: lines.map((line) => ({
                productId: line.product.id,
                quantity: line.quantity,
                price: line.product.price,
              })),
            },
            payment: {
              create: {
                amount: totalAmount,
                method,
                status: "PENDING",
              },
            },
          },
        });
      }, TX_OPTIONS);

      return NextResponse.json({
        orderId: order.id,
        total: Number(order.totalAmount),
        duplicate: false,
      });
    } catch (error) {
      if (error instanceof OutOfStockError) {
        return jsonError(error.message, 400);
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const saved = await prisma.order.findUnique({
          where: lookup,
        });

        if (saved) {
          return existingOrderResponse(saved, requestHash);
        }
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        return jsonError(
          "Concurrent transaction conflict. Retry using the same idempotency key.",
          503,
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return jsonError("Failed to place order", 500);
  }
}
