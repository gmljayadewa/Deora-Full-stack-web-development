import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const md5Upper = (text: string) =>
  crypto.createHash("md5").update(text).digest("hex").toUpperCase();

export async function POST(req: NextRequest) {
  try {
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const ownMerchantId = process.env.PAYHERE_MERCHANT_ID;
    if (!merchantSecret || !ownMerchantId) {
      console.error("PayHere env variables are missing");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const get = (key: string) => String(formData.get(key) ?? "");

    const merchantId = get("merchant_id");
    const orderId = get("order_id");
    const amount = get("payhere_amount");
    const currency = get("payhere_currency");
    const statusCode = get("status_code");
    const md5sig = get("md5sig");
    const paymentId = get("payment_id");

    if (!orderId || !md5sig) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // 1) Verify the signature (proves the request really came from PayHere)
    const localSig = md5Upper(
      merchantId +
        orderId +
        amount +
        currency +
        statusCode +
        md5Upper(merchantSecret),
    );
    if (localSig !== md5sig.toUpperCase() || merchantId !== ownMerchantId) {
      console.error("PayHere signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2) Find the payment and check it matches what we expect
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: true } } },
    });
    if (!payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      currency !== "LKR" ||
      Number(amount).toFixed(2) !== Number(payment.amount).toFixed(2)
    ) {
      console.error("PayHere amount or currency mismatch for order", orderId);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // 3) PayHere can send the same notification more than once
    if (payment.status === "PAID") {
      return NextResponse.json({ received: true });
    }

    // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargeback
    if (statusCode === "2") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { orderId },
          data: {
            status: "PAID",
            transactionId: paymentId || null,
            paidAt: new Date(),
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        }),
        // remove the paid items from the customer's saved cart
        prisma.cartItem.deleteMany({
          where: {
            cart: { userId: payment.order.userId },
            productId: { in: payment.order.items.map((i) => i.productId) },
          },
        }),
      ]);
    } else if (statusCode === "-1" || statusCode === "-2") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { orderId },
          data: { status: "FAILED" },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        }),
      ]);
    }
    // 0 (pending) and -3 (chargeback): nothing to do for now

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Notify webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
