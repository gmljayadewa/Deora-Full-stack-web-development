import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { DELIVERY_FEE } from "@/lib/shipping";

const METHOD_MAP = {
  COD: "CASH_ON_DELIVERY",
  BANK: "BANK_TRANSFER",
  WHATSAPP: "WHATSAPP",
} as const;

const MAX_LINES = 50;
const MAX_QTY = 99;

type CartLine = { productId: string; quantity: number };

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized-Please log in" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const method = METHOD_MAP[body.paymentMethod as keyof typeof METHOD_MAP];
    if (!method) {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 },
      );
    }

    if (!body.shippingAddress) {
      return NextResponse.json(
        { message: "Shipping Address is required" },
        { status: 400 },
      );
    }

    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }
    if (items.length > MAX_LINES) {
      return NextResponse.json({ message: "Too many items" }, { status: 400 });
    }

    // Same product twice = one line
    const wanted = new Map<string, number>();
    for (const line of items as CartLine[]) {
      const qty = Number(line?.quantity);
      if (
        typeof line?.productId !== "string" ||
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return NextResponse.json(
          { message: "Invalid cart item" },
          { status: 400 },
        );
      }
      wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + qty);
    }
    for (const qty of wanted.values()) {
      if (qty > MAX_QTY) {
        return NextResponse.json(
          { message: "Quantity is too large" },
          { status: 400 },
        );
      }
    }

    // Price eka hamadama DB eken
    const products = await prisma.product.findMany({
      where: { id: { in: [...wanted.keys()] } },
    });

    if (products.length !== wanted.size) {
      return NextResponse.json(
        {
          message:
            "Some products are no longer available. Please refresh your cart.",
        },
        { status: 400 },
      );
    }

    const hidden = products.find((p) => !p.isActive);
    if (hidden) {
      return NextResponse.json(
        { message: `${hidden.name} is not available right now` },
        { status: 400 },
      );
    }

    const lines = products.map((p) => ({
      product: p,
      quantity: wanted.get(p.id)!,
    }));

    const itemsTotal = lines.reduce(
      (sum, l) => sum + Number(l.product.price) * l.quantity,
      0,
    );
    const totalAmount = itemsTotal + DELIVERY_FEE;

    // Stock adu karala order eka hadanna: okkoma ekama transaction eke
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const l of lines) {
          const updated = await tx.inventory.updateMany({
            where: { productId: l.product.id, quantity: { gte: l.quantity } },
            data: { quantity: { decrement: l.quantity } },
          });
          if (updated.count === 0) {
            throw new Error(`OUT_OF_STOCK:${l.product.name}`);
          }
        }

        return tx.order.create({
          data: {
            userId,
            customerName: body.customerName,
            phone: body.phone,
            note: body.note,
            totalAmount,
            shippingAddress: body.shippingAddress,
            status: "PENDING",
            items: {
              create: lines.map((l) => ({
                productId: l.product.id,
                quantity: l.quantity,
                price: l.product.price,
              })),
            },
            payment: {
              create: { amount: totalAmount, method, status: "PENDING" },
            },
          },
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("OUT_OF_STOCK:")) {
        return NextResponse.json(
          {
            message: `${e.message.replace("OUT_OF_STOCK:", "")} is out of stock`,
          },
          { status: 400 },
        );
      }
      throw e;
    }

    return NextResponse.json({ orderId: order.id, total: totalAmount });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 },
    );
  }
}
