import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type AdminToken = {
  id: string;
  role: string;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  let decoded: AdminToken;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminToken;
  } catch {
    redirect("/admin/login");
  }

  if (decoded.role !== "ADMIN") {
    redirect("/admin/login");
  }
}

const money = (value: number) =>
  `LKR ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusStyle: Record<string, string> = {
  PENDING: "bg-[#FBF0D9] text-[#805B1B] ring-1 ring-inset ring-[#EAD6A5]",
  CONFIRMED: "bg-[#E8F1EB] text-[#1B4332] ring-1 ring-inset ring-[#C8DFCF]",
  PROCESSING: "bg-[#E8EDFA] text-[#3455A4] ring-1 ring-inset ring-[#CFD8F3]",
  SHIPPED: "bg-[#E8EDFA] text-[#3455A4] ring-1 ring-inset ring-[#CFD8F3]",
  DELIVERED: "bg-[#E1F1E5] text-[#24633B] ring-1 ring-inset ring-[#B9DDC3]",
  CANCELLED: "bg-[#F8E7E7] text-[#A12C2C] ring-1 ring-inset ring-[#F1C6C6]",
};

const dashboardCards = (
  totalOrders: number,
  pendingOrders: number,
  activeProducts: number,
  revenue: number,
) => [
  {
    title: "Total Orders",
    value: totalOrders.toLocaleString(),
    description: "All customer orders",
    icon: "orders",
    iconBg: "bg-[#E8F1EB] text-[#1B4332]",
    accent: "border-t-[#1B4332]",
    color: "bg-[#E8F1EB] text-[#1B4332]",
  },
  {
    title: "Pending Orders",
    value: pendingOrders.toLocaleString(),
    description: "Require attention",
    icon: "pending",
    iconBg: "bg-[#FBF0D9] text-[#805B1B]",
    accent: "border-t-[#C49A4A]",
    color: "bg-[#FBF0D9] text-[#805B1B]",
  },
  {
    title: "Active Products",
    value: activeProducts.toLocaleString(),
    description: "Visible in the store",
    icon: "products",
    iconBg: "bg-[#F2E9DF] text-[#8A5637]",
    accent: "border-t-[#B88764]",
    color: "bg-[#F2E9DF] text-[#75452D]",
  },
  {
    title: "Payments Received",
    value: money(revenue),
    description: "Recorded as PAID",
    icon: "payments",
    iconBg: "bg-[#E8EDFA] text-[#3455A4]",
    accent: "border-t-[#5875C4]",
    color: "bg-[#E8EDFA] text-[#3455A4]",
  },
];

function DashboardIcon({ name }: { name: string }) {
  const className = "h-5 w-5";

  if (name === "orders") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
      >
        <path d="M5 8h14l1 12H4L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
    );
  }

  if (name === "pending") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
      >
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9" />
      </svg>
    );
  }

  if (name === "blog") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
      >
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h8" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 9h18M16 14h2M6 5V3h12" />
    </svg>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalOrders,
    pendingOrders,
    activeProducts,
    paidPayments,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),

    prisma.order.count({
      where: { status: "PENDING" },
    }),

    prisma.product.count({
      where: { isActive: true },
    }),

    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),

    prisma.inventory.findMany({
      where: {
        quantity: { lte: 5 },
        product: { isActive: true },
      },
      include: {
        product: true,
      },
      orderBy: {
        quantity: "asc",
      },
      take: 5,
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      include: {
        payment: true,
      },
    }),
  ]);

  const revenue = Number(paidPayments._sum.amount ?? 0);

  const cards = dashboardCards(
    totalOrders,
    pendingOrders,
    activeProducts,
    revenue,
  );

  return (
    <main className="min-h-screen bg-[#F7F7F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#367653]">
              Deora Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1B4332] sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#6B756D]">
              Welcome back! Here&apos;s your store overview.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D9DFD6] bg-white px-4 text-sm font-semibold text-[#1B4332] shadow-sm transition hover:bg-[#E8F1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A5C] focus-visible:ring-offset-2"
          >
            View Store
            <span aria-hidden="true">↗</span>
          </Link>
        </header>

        {/* Statistics Cards */}
        <section
          aria-label="Store statistics"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {cards.map((card) => (
            <article
              key={card.title}
              className={`flex min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E6DD] border-t-4 ${card.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#6B756D]">
                    {card.title}
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#1B4332]">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <DashboardIcon name={card.icon} />
                </div>
              </div>

              <div
                className={`mt-5 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${card.color}`}
              >
                {card.description}
              </div>
            </article>
          ))}
        </section>

        {/* Recent Orders and Low Stock */}
        <section className="mt-8 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Recent Orders */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E6DD] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECEDE5] px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#1B4332]">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-[#6B756D]">
                  Latest customer orders and their status.
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex h-10 min-w-[148px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24563F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A5C] focus-visible:ring-offset-2"
              >
                <span>View All Orders</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F1EB] text-[#1B4332]">
                  <DashboardIcon name="orders" />
                </div>

                <p className="mt-4 font-semibold text-[#26382D]">
                  No orders yet
                </p>

                <p className="mt-1 text-sm text-[#6B756D]">
                  Customer orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[22%]" />
                    <col className="w-[24%]" />
                    <col className="w-[22%]" />
                  </colgroup>

                  <thead>
                    <tr className="bg-[#F5F7F2] text-xs uppercase tracking-wider text-[#6B756D]">
                      <th className="px-5 py-4 font-semibold sm:px-6">
                        Order / Customer
                      </th>

                      <th className="px-4 py-4 font-semibold">Order Date</th>

                      <th className="px-4 py-4 font-semibold">Amount</th>

                      <th className="px-4 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F0F1EB]">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-[#FAFBF8]"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <p className="truncate font-semibold text-[#26382D]">
                            {order.customerName || "Customer"}
                          </p>

                          <p className="mt-1 truncate font-mono text-xs text-[#879087]">
                            #{order.id.slice(0, 10)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-[#6B756D] sm:text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-LK",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-[#1B4332] sm:text-sm">
                          {money(Number(order.totalAmount))}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex min-h-7 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold sm:text-xs ${
                              statusStyle[order.status] ??
                              "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-[#ECEDE5] bg-[#FAFAF6] px-5 py-3 sm:px-6">
              <p className="text-xs text-[#6B756D]">
                Showing the latest {recentOrders.length} orders.
              </p>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E6DD] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#ECEDE5] px-5 py-5">
              <div>
                <h2 className="font-bold text-[#1B4332]">Low Stock Alert</h2>

                <p className="mt-1 text-sm text-[#6B756D]">
                  Active products with 5 or fewer items.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF0D9] text-[#805B1B]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M12 3 22 20H2L12 3Z" />
                  <path d="M12 9v5m0 3h.01" />
                </svg>
              </div>
            </div>

            {lowStock.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F1EB] text-[#367653]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-semibold text-[#26382D]">
                  Stock looks good
                </p>

                <p className="mt-1 text-xs text-[#6B756D]">
                  No low-stock products found.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#F0F1EB]">
                {lowStock.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#FAFBF8]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#26382D]">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-[#6B756D]">
                        Inventory warning
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#F8E7E7] px-3 py-1.5 text-xs font-bold text-[#A12C2C] ring-1 ring-inset ring-[#F1C6C6]">
                      {item.quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Management Shortcuts */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#1B4332]">Management</h2>

            <p className="mt-1 text-sm text-[#6B756D]">
              Quick access to store management sections.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Orders",
                description: "Review orders and update their status.",
                href: "/admin/orders",
                icon: "orders",
                color: "bg-[#E8F1EB] text-[#1B4332]",
                border: "hover:border-[#B8D4C0]",
              },
              {
                title: "Products",
                description: "Manage product details and availability.",
                href: "/admin/products",
                icon: "products",
                color: "bg-[#E8EDFA] text-[#3455A4]",
                border: "hover:border-[#CFD8F3]",
              },
              {
                title: "Inventory",
                description: "Monitor your stock levels.",
                href: "/admin/inventory",
                icon: "products",
                color: "bg-[#FBF0D9] text-[#805B1B]",
                border: "hover:border-[#EAD6A5]",
              },
              {
                title: "Blog",
                description: "Create and edit store articles.",
                href: "/admin/blog",
                icon: "blog",
                color: "bg-[#F2E9DF] text-[#8A5637]",
                border: "hover:border-[#DEC6B3]",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group flex min-h-[180px] flex-col rounded-2xl border border-[#E5E6DD] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${item.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <DashboardIcon name={item.icon} />
                  </span>

                  <span className="text-lg text-[#A0A79F] transition group-hover:translate-x-1 group-hover:text-[#367653]">
                    →
                  </span>
                </div>

                <h3 className="mt-4 font-bold text-[#1B4332]">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-[#6B756D]">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
