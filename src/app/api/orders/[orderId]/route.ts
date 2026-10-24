import { NextRequest, NextResponse } from "next/server";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { restoreStock } from "@/services/inventory.service";

// නීති කඩවුණාම යවන error එක (status code එකත් එක්ක)
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

// Order එකට මාරු වෙන්න පුළුවන් ඊළඟ තත්වයන්
const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// Payment එකට මාරු වෙන්න පුළුවන් ඊළඟ තත්වයන්
const PAYMENT_FLOW: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  FAILED: ["PENDING", "PAID"],
  PAID: ["REFUNDED"],
  REFUNDED: [],
};

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

    const orderStatus = body.orderStatus as OrderStatus | undefined;
    const paymentStatus = body.paymentStatus as PaymentStatus | undefined;

    if (!orderStatus && !paymentStatus) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }
    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 },
      );
    }
    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { message: "Invalid payment status" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });
      if (!order) throw new ApiError(404, "Order not found");
      const payment = order.payment;

      // ===== 1) Payment වෙනස්කම පරීක්ෂා කරනවා =====
      if (paymentStatus) {
        if (!payment)
          throw new ApiError(400, "This order has no payment record");

        if (paymentStatus !== payment.status) {
          if (!PAYMENT_FLOW[payment.status].includes(paymentStatus)) {
            throw new ApiError(
              400,
              `Payment cannot change from ${payment.status} to ${paymentStatus}`,
            );
          }
          // Card ගෙවීම් තහවුරු වෙන්නේ PayHere notification එකෙන් විතරයි
          if (
            payment.method === "CARD" &&
            (paymentStatus === "PAID" || paymentStatus === "FAILED")
          ) {
            throw new ApiError(
              400,
              "Card payments are confirmed automatically by PayHere and cannot be changed manually.",
            );
          }
        }
      }

      // ===== 2) Order වෙනස්කම පරීක්ෂා කරනවා =====
      if (
        orderStatus &&
        orderStatus !== order.status &&
        !ORDER_FLOW[order.status].includes(orderStatus)
      ) {
        throw new ApiError(
          400,
          `Order cannot change from ${order.status} to ${orderStatus}`,
        );
      }

      // ===== 3) අවසාන තත්වයන් තීරණය කරනවා =====
      let nextOrder: OrderStatus = orderStatus ?? order.status;
      let nextPayment: PaymentStatus | undefined =
        paymentStatus ?? payment?.status;

      // Payment PAID කළාම PENDING order එක ඉබේම CONFIRMED
      if (
        !orderStatus &&
        paymentStatus === "PAID" &&
        order.status === "PENDING"
      ) {
        nextOrder = "CONFIRMED";
      }
      // COD order එක DELIVERED කළාම සල්ලි ලැබුණා කියලා PAID
      if (
        nextOrder === "DELIVERED" &&
        order.status !== "DELIVERED" &&
        payment?.method === "CASH_ON_DELIVERY" &&
        nextPayment === "PENDING"
      ) {
        nextPayment = "PAID";
      }

      // ===== 4) Order සහ payment එකිනෙකට බලපාන නීති =====
      const cancelling =
        nextOrder === "CANCELLED" && order.status !== "CANCELLED";

      if (nextOrder === "CANCELLED" && paymentStatus === "PAID") {
        throw new ApiError(
          400,
          "A cancelled order cannot be marked as paid. Refund it instead.",
        );
      }
      if (cancelling && nextPayment === "PAID") {
        throw new ApiError(
          400,
          'This order is already paid. To cancel it, also send paymentStatus: "REFUNDED".',
        );
      }

      // ===== 5) Database එකට ලියනවා (වෙන කෙනෙක් ඒ අතරේ වෙනස් කළා නම් 409) =====
      if (payment && nextPayment && nextPayment !== payment.status) {
        const p = await tx.payment.updateMany({
          where: { id: payment.id, status: payment.status },
          data: {
            status: nextPayment,
            ...(nextPayment === "PAID" ? { paidAt: new Date() } : {}),
          },
        });
        if (p.count === 0) {
          throw new ApiError(
            409,
            "Payment was changed by someone else. Refresh and try again.",
          );
        }
      }

      if (nextOrder !== order.status) {
        const o = await tx.order.updateMany({
          where: { id: orderId, status: order.status },
          data: { status: nextOrder },
        });
        if (o.count === 0) {
          throw new ApiError(
            409,
            "Order was changed by someone else. Refresh and try again.",
          );
        }
        // Cancel කළාම stock ආපහු එකතු කරනවා (ඉහළ claim එක ඇතුළේ නිසා එක පාරයි)
        if (cancelling) await restoreStock(tx, order.items);
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { payment: true },
      });
    }, TX_OPTIONS);

    return NextResponse.json({
      orderId: result.id,
      orderStatus: result.status,
      paymentStatus: result.payment?.status,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("PATCH /api/orders/[orderId] error:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );
  }
}
