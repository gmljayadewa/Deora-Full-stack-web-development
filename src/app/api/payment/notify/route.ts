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
    const md5sig = get("md5sig").toUpperCase();
    const paymentId = get("payment_id");

    if (!orderId || !md5sig) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const localSig = md5Upper(
      merchantId +
        orderId +
        amount +
        currency +
        statusCode +
        md5Upper(merchantSecret),
    );

    if (
      merchantId !== ownMerchantId ||
      !/^[A-F0-9]{32}$/.test(md5sig) ||
      localSig !== md5sig
    ) {
      console.error("PayHere signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

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

    const receivedAmount = Number(amount);
    const expectedAmount = Number(payment.amount);

    if (
      !Number.isFinite(receivedAmount) ||
      !Number.isFinite(expectedAmount) ||
      receivedAmount <= 0 ||
      currency !== "LKR" ||
      receivedAmount.toFixed(2) !== expectedAmount.toFixed(2)
    ) {
      console.error("PayHere amount or currency mismatch", orderId);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (statusCode === "2") {
      if (!paymentId) {
        return NextResponse.json(
          { error: "Missing payment id" },
          { status: 400 },
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const confirmed = await tx.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "CONFIRMED" },
        });

        if (confirmed.count === 0) {
          const current = await tx.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
          });

          if (
            current?.status === "CONFIRMED" &&
            current.payment?.status === "PAID" &&
            current.payment.transactionId === paymentId
          ) {
            return "DUPLICATE";
          }

          if (current?.status === "CANCELLED") {
            if (current.payment?.status === "REFUNDED") {
              return "ALREADY_REFUNDED";
            }

            if (
              current.payment?.status === "PAID" &&
              current.payment.transactionId === paymentId
            ) {
              console.error(
                "PAYMENT_AFTER_CANCEL: refund review required",
                orderId,
              );
              return "REFUND_REVIEW";
            }

            const captured = await tx.payment.updateMany({
              where: {
                orderId,
                status: { in: ["PENDING", "FAILED"] },
              },
              data: {
                status: "PAID",
                transactionId: paymentId,
                paidAt: new Date(),
              },
            });

            if (captured.count !== 1) {
              throw new Error("PAYMENT_STATE_CONFLICT_AFTER_CANCEL");
            }

            console.error(
              "PAYMENT_AFTER_CANCEL: refund review required",
              orderId,
            );

            return "REFUND_REVIEW";
          }

          return "NOT_PROCESSED";
        }

        const claimed = await tx.payment.updateMany({
          where: {
            orderId,
            status: { in: ["PENDING", "FAILED"] },
          },
          data: {
            status: "PAID",
            transactionId: paymentId,
            paidAt: new Date(),
          },
        });

        if (claimed.count !== 1) {
          throw new Error("PAYMENT_STATE_CONFLICT");
        }

        await tx.cartItem.deleteMany({
          where: {
            cart: { userId: payment.order.userId },
            productId: {
              in: payment.order.items.map((item) => item.productId),
            },
          },
        });

        return "PROCESSED";
      }, TX_OPTIONS);

      if (result === "REFUND_REVIEW") {
        return NextResponse.json({ received: true });
      }

      if (result === "NOT_PROCESSED") {
        console.error(
          "PAYHERE_SUCCESS_NOT_PROCESSED: order state conflict",
          orderId,
        );
        return NextResponse.json(
          { error: "Order state conflict; review required" },
          { status: 409 },
        );
      }
    } else if (statusCode === "-1" || statusCode === "-2") {
      await prisma.$transaction(async (tx) => {
        const cancelled = await tx.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "CANCELLED" },
        });

        if (cancelled.count === 0) {
          return;
        }

        const failed = await tx.payment.updateMany({
          where: {
            orderId,
            status: "PENDING",
          },
          data: { status: "FAILED" },
        });

        if (failed.count !== 1) {
          throw new Error("PAYMENT_STATE_CONFLICT");
        }

        await restoreStock(tx, payment.order.items);
      }, TX_OPTIONS);
    } else if (statusCode === "-3") {
      console.error("PAYHERE_CHARGEBACK: manual review required", {
        orderId,
        paymentId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Notify webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
