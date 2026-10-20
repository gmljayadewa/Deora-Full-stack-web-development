import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { restoreStock } from "@/services/inventory.service";

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type Params = Promise<{ orderId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const auth = getAuth(request);
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized-Please log in" },
        { status: 401 },
      );
    }
    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 },
      );
    }

    const { orderId } = await params;
    const body = await request.json();

    const paymentStatus = body.paymentStatus as
      | (typeof PAYMENT_STATUSES)[number]
      | undefined;
    const orderStatus = body.orderStatus as
      | (typeof ORDER_STATUSES)[number]
      | undefined;

    if (!paymentStatus && !orderStatus) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }
    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { message: "Invalid payment status" },
        { status: 400 },
      );
    }
    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });
      if (!order) throw new Error("NOT_FOUND");

      // Cancel karapu order eka aye open karanna baha (stock aye adu karanna wenawa)
      if (
        order.status === "CANCELLED" &&
        orderStatus &&
        orderStatus !== "CANCELLED"
      ) {
        throw new Error("ORDER_CANCELLED");
      }

      // Payment eka PAID karama, order eka PENDING nam CONFIRMED karanawa
      let nextStatus = orderStatus;
      if (
        !nextStatus &&
        paymentStatus === "PAID" &&
        order.status === "PENDING"
      ) {
        nextStatus = "CONFIRMED";
      }

      if (paymentStatus && order.payment) {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: paymentStatus,
            ...(paymentStatus === "PAID" ? { paidAt: new Date() } : {}),
          },
        });
      }

      // Cancel: "claim" karala stock aye ekathu karanawa (ekapaarak witharai, method ekata balanne na)
      if (nextStatus === "CANCELLED") {
        const claimed = await tx.order.updateMany({
          where: { id: orderId, status: { not: "CANCELLED" } },
          data: { status: "CANCELLED" },
        });
        if (claimed.count === 1) await restoreStock(tx, order.items);
      }

      return tx.order.update({
        where: { id: orderId },
        data: nextStatus ? { status: nextStatus } : {},
        include: { payment: true },
      });
    });

    return NextResponse.json({
      orderId: updated.id,
      orderStatus: updated.status,
      paymentStatus: updated.payment?.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "ORDER_CANCELLED") {
      return NextResponse.json(
        { message: "A cancelled order cannot be reopened" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/orders/[orderId] error:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );
  }
}
