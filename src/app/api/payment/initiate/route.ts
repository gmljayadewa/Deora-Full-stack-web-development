import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { generatePayHereHash } from "@/lib/payhere";
import { DELIVERY_FEE } from "@/lib/shipping";
import { decrementStock, OutOfStockError } from "@/services/inventory.service";

const JWT_SECRET = process.env.JWT_SECRET!;
const MAX_LINES = 50;
const MAX_QTY = 99;

type CartLine = { productId: string; quantity: number };

export async function POST(request: NextRequest) {
  try {
    let userId: string;

    // Reading and checking the token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized-Please log in" },
        { status: 401 },
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: string;
      };
      userId = decoded.id;
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // PayHere settings must exist before we create any order
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      console.error("PayHere env variables are missing");
      return NextResponse.json(
        { message: "Payment is not configured" },
        { status: 500 },
      );
    }

    const { shippingAddress, items } = await request.json();
    if (!shippingAddress) {
      return NextResponse.json(
        { message: "Shipping Address is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }
    if (items.length > MAX_LINES) {
      return NextResponse.json({ message: "Too many items" }, { status: 400 });
    }

    // Clean the cart lines: same product twice becomes one line
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

    // Prices always come from the database, never from the browser
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

    // Creating the order in the database
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Stock adu karanna (COD / Bank wage hama method ekatama ekama rule eka)
        for (const l of lines) {
          await decrementStock(tx, l.product.id, l.quantity, l.product.name);
        }

        return tx.order.create({
          data: {
            userId,
            totalAmount,
            shippingAddress,
            status: "PENDING",
            items: {
              create: lines.map((l) => ({
                productId: l.product.id,
                quantity: l.quantity,
                price: l.product.price,
              })),
            },
            payment: {
              create: {
                amount: totalAmount,
                method: "CARD",
                status: "PENDING",
              },
            },
          },
        });
      }, TX_OPTIONS);
    } catch (e) {
      if (e instanceof OutOfStockError) {
        return NextResponse.json({ message: e.message }, { status: 400 });
      }
      throw e;
    }

    // Generating the hash and responding
    const currency = "LKR";

    const hash = generatePayHereHash({
      params: {
        merchantId,
        orderId: order.id,
        amount: totalAmount,
        currency,
        merchantSecret,
      },
    });

    return NextResponse.json({
      merchantId,
      orderId: order.id,
      amount: totalAmount.toFixed(2),
      currency,
      hash,
    });
  } catch (error) {
    console.error("POST /api/payment/initiate error:", error);
    return NextResponse.json(
      { message: "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
