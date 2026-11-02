"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type Order = {
  id: string;
  customerName: string | null;
  phone: string | null;
  shippingAddress: string;
  note: string | null;
  totalAmount: string | number;
  status: OrderStatus;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: string | number;
    product: {
      name: string;
    };
  }[];
  payment: {
    method: string;
    status: PaymentStatus;
    amount: string | number;
  } | null;
};

type Draft = {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
};

const orderFlow: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const paymentFlow: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  FAILED: ["PENDING", "PAID"],
  PAID: ["REFUNDED"],
  REFUNDED: [],
};

const statusColors: Record<string, string> = {
  PENDING: "bg-[#FBF0D9] text-[#805B1B]",
  CONFIRMED: "bg-[#E8F1EB] text-[#1B4332]",
  PROCESSING: "bg-[#E8EDFA] text-[#3455A4]",
  SHIPPED: "bg-[#E8EDFA] text-[#3455A4]",
  DELIVERED: "bg-[#E1F1E5] text-[#24633B]",
  CANCELLED: "bg-[#F8E7E7] text-[#A12C2C]",
  PAID: "bg-[#E1F1E5] text-[#24633B]",
  FAILED: "bg-[#F8E7E7] text-[#A12C2C]",
  REFUNDED: "bg-[#F2E9DF] text-[#75452D]",
};

const money = (amount: number | string) =>
  `LKR ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const readable = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      const loadedOrders: Order[] = data.orders ?? [];

      setOrders(loadedOrders);

      const nextDrafts: Record<string, Draft> = {};

      for (const order of loadedOrders) {
        nextDrafts[order.id] = {
          orderStatus: order.status,
          paymentStatus: order.payment?.status ?? "PENDING",
        };
      }

      setDrafts(nextDrafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const updateDraft = (orderId: string, field: keyof Draft, value: string) => {
    setDrafts((previous) => ({
      ...previous,
      [orderId]: {
        ...previous[orderId],
        [field]: value,
      },
    }));

    setMessage("");
  };

  const saveOrder = async (order: Order) => {
    const draft = drafts[order.id];

    if (!draft) return;

    const orderChanged = draft.orderStatus !== order.status;
    const paymentChanged =
      draft.paymentStatus !== (order.payment?.status ?? "PENDING");

    if (!orderChanged && !paymentChanged) {
      setMessage("No changes to save.");
      return;
    }

    if (paymentChanged && !order.payment) {
      setError("This order has no payment record.");
      return;
    }

    setSavingId(order.id);
    setError("");
    setMessage("");

    try {
      const payload: {
        orderStatus?: OrderStatus;
        paymentStatus?: PaymentStatus;
      } = {};

      if (orderChanged) {
        payload.orderStatus = draft.orderStatus;
      }

      if (paymentChanged) {
        payload.paymentStatus = draft.paymentStatus;
      }

      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order.");
      }

      setMessage(`Order #${order.id.slice(0, 10)} updated successfully.`);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setSavingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      !term ||
      order.id.toLowerCase().includes(term) ||
      (order.customerName ?? order.user.name).toLowerCase().includes(term) ||
      order.user.email.toLowerCase().includes(term) ||
      (order.phone ?? "").includes(term);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "UNPAID"
        ? order.payment?.status === "PENDING"
        : order.status === filter);

    return matchesSearch && matchesFilter;
  });

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const paidCount = orders.filter(
    (order) => order.payment?.status === "PAID",
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F7F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#367653] hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#367653]">
              Deora Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1B4332] sm:text-4xl">
              Orders Management
            </h1>

            <p className="mt-2 text-sm text-[#6B756D]">
              Review customer orders and manage order and payment statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D9DFD6] bg-white px-4 text-sm font-semibold text-[#1B4332] shadow-sm hover:bg-[#E8F1EB] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Orders"
            value={orders.length}
            color="border-t-[#1B4332]"
            iconColor="bg-[#E8F1EB] text-[#1B4332]"
            icon="▤"
          />

          <SummaryCard
            title="Pending Orders"
            value={pendingCount}
            color="border-t-[#C49A4A]"
            iconColor="bg-[#FBF0D9] text-[#805B1B]"
            icon="◷"
          />

          <SummaryCard
            title="Paid Orders"
            value={paidCount}
            color="border-t-[#5875C4]"
            iconColor="bg-[#E8EDFA] text-[#3455A4]"
            icon="✓"
          />
        </section>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-[#F1C6C6] bg-[#F8E7E7] px-4 py-3 text-sm text-[#A12C2C]"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#C8DFCF] bg-[#E8F1EB] px-4 py-3 text-sm text-[#1B4332]"
          >
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#E5E6DD] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#ECEDE5] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-bold text-[#1B4332]">All Orders</h2>
              <p className="mt-1 text-sm text-[#6B756D]">
                Showing {filteredOrders.length} of {orders.length} orders.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order or customer..."
                aria-label="Search orders"
                className="h-10 min-w-0 rounded-lg border border-[#D9DFD6] px-3 text-sm text-[#26382D] outline-none focus:border-[#367653] focus:ring-2 focus:ring-[#E8F1EB] sm:w-64"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter orders"
                className="h-10 rounded-lg border border-[#D9DFD6] bg-white px-3 text-sm text-[#26382D] outline-none focus:border-[#367653]"
              >
                <option value="ALL">All status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="UNPAID">Payment pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-[#6B756D]">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F1EB] text-xl text-[#1B4332]">
                ▤
              </div>
              <h3 className="mt-4 font-semibold text-[#1B4332]">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-[#6B756D]">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ECEDE5]">
              {filteredOrders.map((order) => {
                const draft = drafts[order.id];

                if (!draft) return null;

                const paymentStatus = order.payment?.status ?? "PENDING";
                const paymentOptions = [
                  paymentStatus,
                  ...paymentFlow[paymentStatus],
                ].filter(
                  (status, index, all) =>
                    all.indexOf(status) === index &&
                    !(
                      order.payment?.method === "CARD" &&
                      (status === "PAID" || status === "FAILED")
                    ),
                );

                const orderOptions = [order.status, ...orderFlow[order.status]];

                const changed =
                  draft.orderStatus !== order.status ||
                  draft.paymentStatus !== paymentStatus;

                return (
                  <article key={order.id} className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-mono text-sm font-bold text-[#1B4332]">
                            #{order.id.slice(0, 10)}
                          </h3>

                          <StatusPill status={order.status} />
                        </div>

                        <p className="mt-2 font-semibold text-[#26382D]">
                          {order.customerName || order.user.name}
                        </p>

                        <p className="mt-1 break-all text-sm text-[#6B756D]">
                          {order.user.email}
                        </p>

                        {order.phone && (
                          <p className="mt-1 text-sm text-[#6B756D]">
                            Phone: {order.phone}
                          </p>
                        )}

                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B756D]">
                          <span className="font-semibold text-[#26382D]">
                            Address:
                          </span>{" "}
                          {order.shippingAddress}
                        </p>

                        {order.note && (
                          <p className="mt-2 text-sm text-[#6B756D]">
                            <span className="font-semibold text-[#26382D]">
                              Note:
                            </span>{" "}
                            {order.note}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-[#879087]">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleString("en-LK", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>

                      <div className="w-full rounded-xl border border-[#E5E6DD] bg-[#FAFBF8] p-4 xl:max-w-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-[#6B756D]">
                            Order total
                          </span>
                          <span className="font-bold text-[#1B4332]">
                            {money(order.totalAmount)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm text-[#6B756D]">
                            Payment
                          </span>
                          {order.payment ? (
                            <StatusPill status={order.payment.status} />
                          ) : (
                            <span className="text-xs text-[#A12C2C]">
                              No payment record
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-[#6B756D]">
                          Method: {order.payment?.method ?? "Not recorded"}
                        </p>

                        <div className="mt-4 border-t border-[#E5E6DD] pt-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B756D]">
                            Items
                          </p>

                          <ul className="space-y-2">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between gap-3 text-sm"
                              >
                                <span className="min-w-0 text-[#26382D]">
                                  {item.product.name}{" "}
                                  <span className="text-[#879087]">
                                    × {item.quantity}
                                  </span>
                                </span>
                                <span className="shrink-0 text-[#1B4332]">
                                  {money(Number(item.price) * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-[#E5E6DD] pt-4">
                          <div>
                            <label
                              htmlFor={`order-${order.id}`}
                              className="mb-1.5 block text-xs font-semibold text-[#26382D]"
                            >
                              Order status
                            </label>

                            <select
                              id={`order-${order.id}`}
                              value={draft.orderStatus}
                              onChange={(event) =>
                                updateDraft(
                                  order.id,
                                  "orderStatus",
                                  event.target.value,
                                )
                              }
                              className="h-10 w-full rounded-lg border border-[#D9DFD6] bg-white px-3 text-sm outline-none focus:border-[#367653]"
                            >
                              {orderOptions.map((status) => (
                                <option key={status} value={status}>
                                  {readable(status)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {order.payment && (
                            <div>
                              <label
                                htmlFor={`payment-${order.id}`}
                                className="mb-1.5 block text-xs font-semibold text-[#26382D]"
                              >
                                Payment status
                              </label>

                              <select
                                id={`payment-${order.id}`}
                                value={draft.paymentStatus}
                                onChange={(event) =>
                                  updateDraft(
                                    order.id,
                                    "paymentStatus",
                                    event.target.value,
                                  )
                                }
                                className="h-10 w-full rounded-lg border border-[#D9DFD6] bg-white px-3 text-sm outline-none focus:border-[#367653]"
                              >
                                {paymentOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {readable(status)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => void saveOrder(order)}
                            disabled={
                              !changed ||
                              savingId === order.id ||
                              savingId !== null
                            }
                            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#1B4332] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24563F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A5C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#A6B5A9]"
                          >
                            {savingId === order.id
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                          {draft.orderStatus === "CANCELLED" &&
                            order.status !== "CANCELLED" &&
                            paymentStatus === "PAID" && (
                              <p className="text-xs leading-5 text-[#805B1B]">
                                A paid order must also be marked REFUNDED before
                                cancellation can succeed.
                              </p>
                            )}

                          {order.payment?.method === "CARD" && (
                            <p className="text-xs leading-5 text-[#6B756D]">
                              Card payment outcomes are controlled by PayHere.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  color,
  iconColor,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  iconColor: string;
  icon: string;
}) {
  return (
    <article
      className={`flex min-h-[130px] items-center justify-between gap-4 rounded-2xl border border-[#E5E6DD] border-t-4 ${color} bg-white p-5 shadow-sm`}
    >
      <div>
        <p className="text-sm font-medium text-[#6B756D]">{title}</p>
        <p className="mt-2 text-3xl font-bold text-[#1B4332]">
          {value.toLocaleString()}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${iconColor}`}
      >
        {icon}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
        statusColors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {readable(status)}
    </span>
  );
}
