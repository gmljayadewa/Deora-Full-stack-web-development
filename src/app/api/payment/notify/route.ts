import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { restoreStock } from "@/services/inventory.service";

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

    // 1) Signature verify (request eka PayHere eken da kiyala)
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

    // 2) Payment eka hoyala, amount / currency / method check
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: true } } },
    });
    if (!payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (payment.method !== "CARD") {
      return NextResponse.json(
        { error: "Not a card payment" },
        { status: 400 },
      );
    }
    if (
      currency !== "LKR" ||
      Number(amount).toFixed(2) !== Number(payment.amount).toFixed(2)
    ) {
      console.error("PayHere amount or currency mismatch for order", orderId);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargeback
    if (statusCode === "2") {
      if (!paymentId) {
        console.error("PayHere success without payment_id for order", orderId);
        return NextResponse.json(
          { error: "Missing payment id" },
          { status: 400 },
        );
      }

      await prisma.$transaction(async (tx) => {
        // "Claim": ekama welawe notifications 2k awath, ekakata witharai count = 1
        const claimed = await tx.payment.updateMany({
          where: { orderId, status: { in: ["PENDING", "FAILED"] } },
          data: {
            status: "PAID",
            transactionId: paymentId,
            paidAt: new Date(),
          },
        });
        if (claimed.count === 0) return; // duplicate notification

        const confirmed = await tx.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "CONFIRMED" },
        });
        if (confirmed.count === 0) {
          // Order eka kalinma cancel wela (stock aye ekathu wela). Mudal awa: admin refund karanna ona.
          console.error(
            "PAYMENT_AFTER_CANCEL: refund needed for order",
            orderId,
          );
          return;
        }

        // Paid items customer ge saved cart eken ain karanna
        await tx.cartItem.deleteMany({
          where: {
            cart: { userId: payment.order.userId },
            productId: { in: payment.order.items.map((i) => i.productId) },
          },
        });
      }, TX_OPTIONS);
    } else if (statusCode === "-1" || statusCode === "-2") {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: { status: "FAILED" },
        });
        if (claimed.count === 0) return; // already handled

        const cancelled = await tx.order.updateMany({
          where: { id: orderId, status: { not: "CANCELLED" } },
          data: { status: "CANCELLED" },
        });
        // Stock aye ekathu karanne ekapaarak witharai
        if (cancelled.count === 1) {
          await restoreStock(tx, payment.order.items);
        }
      }, TX_OPTIONS);
    } else if (statusCode === "-3") {
      // Chargeback: danata log witharai (payment status enum eke CHARGEBACK nae)
      console.error("PAYHERE_CHARGEBACK for order", orderId);
    }
    // 0 (pending): nothing to do

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Notify webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
