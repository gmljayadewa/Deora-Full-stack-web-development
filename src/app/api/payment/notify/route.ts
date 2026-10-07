import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchant_id = formData.get("merchant_id") as string;
    const order_id = formData.get("order_id") as string;
    const payhere_amount = formData.get("payhere_amount") as string;
    const payhere_currency = formData.get("payhere_currency") as string;
    const status_code = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;
    const payment_id = formData.get("payment_id") as string;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;

    // Hash verify කරනවා - fraud/tampering check එක
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localSig = crypto
      .createHash("md5")
      .update(
        merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    if (localSig !== md5sig) {
      console.error("Hash mismatch - possible tampering attempt");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
    if (status_code === "2") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            status: "PAID",
            transactionId: payment_id,
            paidAt: new Date(),
          },
        }),
        prisma.order.update({
          where: { id: order_id },
          data: { status: "CONFIRMED" },
        }),
      ]);
    } else if (status_code === "-1" || status_code === "-2") {
      await prisma.payment.update({
        where: { orderId: order_id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Notify webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
} 