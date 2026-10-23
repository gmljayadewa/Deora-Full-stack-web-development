"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { DELIVERY_FEE } from "../../lib/shipping";
import type { Product } from "@/lib/products";
import {
  loadBuyNow,
  clearBuyNow,
  PAY_LABELS,
  PAY_DESCRIPTIONS,
  type PayMethod,
} from "@/lib/buyNow";

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type CheckoutItem = { product: Product; quantity: number };

export default function CheckoutPage() {
  const { items, ready, clearCart } = useCart();
  const router = useRouter();

  // Buy Now: ekama product eka + payment method eka (URL eke ?method=...)
  const [buyNow, setBuyNow] = useState<CheckoutItem | null>(null);
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [methodError, setMethodError] = useState("");
  const [buyNowChecked, setBuyNowChecked] = useState(false);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("method");
    if (m && m in PAY_LABELS) {
      setMethod(m as PayMethod);
      setBuyNow(loadBuyNow());
    } else {
      clearBuyNow(); // cart eken enawa nam, kalin cancel karapu Buy Now eka ain karanna
    }
    setBuyNowChecked(true);
  }, []);

  // Buy Now nam ekama product eka, nathnam cart eka
  const checkoutItems: CheckoutItem[] = buyNow ? [buyNow] : items;
  const subtotal = checkoutItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    note: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);
  const paymentRef = useRef<HTMLDivElement>(null);
  // Order eka dapu passe cart eka hisa wenakota shop ekata redirect wena eka nawaththanna
  const orderPlaced = useRef(false);

  useEffect(() => {
    if (orderPlaced.current) return;
    if (buyNowChecked && ready && checkoutItems.length === 0)
      router.push("/shop");
  }, [buyNowChecked, ready, checkoutItems.length, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return; // guard against double-click

    if (!method) {
      setMethodError("Please choose a payment method");
      // ගෙවීම් ක්‍රම තියෙන තැනට scroll කරනවා
      paymentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setLoading(true);

    const shippingAddress = `${formData.address},${formData.city},${formData.postalCode},${formData.province}`;
    const lineItems = checkoutItems.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }));

    try {
      // ===== COD / Bank Transfer / WhatsApp =====
      if (method !== "CARD") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            paymentMethod: method,
            customerName: formData.fullName,
            phone: formData.phone,
            note: formData.note,
            shippingAddress,
            items: lineItems,
          }),
        });

        if (res.status === 401) {
          setLoading(false);
          alert("Please log in to continue.");
          router.push(
            `/login?next=${encodeURIComponent(`/checkout?method=${method}`)}`,
          );
          return;
        }

        if (!res.ok) {
          let message = "Failed to place order";
          try {
            const err = await res.json();
            if (err?.message) message = err.message;
          } catch {
            // response was not JSON
          }
          throw new Error(message);
        }

        const data = await res.json();

        // Mulin salakuna danawa, passe cart eka hisa karanawa
        // (nathnam cart eka hisa unama useEffect eka shop ekata yawanawa)
        orderPlaced.current = true;
        if (buyNow) clearBuyNow();
        else clearCart();

        if (method === "WHATSAPP") {
          const lines = checkoutItems
            .map(({ product, quantity }) => `${quantity} x ${product.name}`)
            .join("\n");
          const text =
            `New order #${data.orderId}\n${lines}\n` +
            `Total: ${formatPrice(data.total)}\n` +
            `Name: ${formData.fullName}\nPhone: ${formData.phone}\n` +
            `Address: ${formData.address}, ${formData.city}`;
          window.location.href = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
          return;
        }

        router.push(
          `/checkout/success?order_id=${data.orderId}&method=${method}`,
        );
        return;
      }

      // ===== Card Payment (PayHere) =====
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shippingAddress,
          items: lineItems,
        }),
      });

      // Not logged in: go to login, then come back here
      if (res.status === 401) {
        setLoading(false);
        alert("Please log in to continue.");
        router.push(
          `/login?next=${encodeURIComponent(`/checkout?method=${method}`)}`,
        );
        return;
      }

      if (!res.ok) {
        let message = "Failed to create order";
        try {
          const err = await res.json();
          if (err?.message) message = err.message;
        } catch {
          // response was not JSON
        }
        console.error("initiate failed:", res.status, message);
        throw new Error(message);
      }

      const data = await res.json();

      if (!data.hash || !data.orderId || !data.merchantId) {
        throw new Error("Invalid response from server");
      }

      // PayHere must reach this URL from the internet (ngrok or your live site).
      const publicUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
      const lastName = rest.join(" ") || firstName;

      const fields: Record<string, string> = {
        merchant_id: data.merchantId,
        return_url: `${window.location.origin}/checkout/success?order_id=${data.orderId}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
        notify_url: `${publicUrl}/api/payment/notify`,
        order_id: data.orderId,
        items: checkoutItems.map(({ product }) => product.name).join(","),
        currency: data.currency,
        amount: data.amount,
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: "Sri Lanka",
        hash: data.hash,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // No setLoading(false) here on purpose: the page is navigating away to PayHere
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  // Wait for the saved cart to load; the effect above redirects when it is empty
  if (!ready || !buyNowChecked || checkoutItems.length === 0) return null;

  // ක්‍රමයක් තෝරලා නැත්නම් button එකෙන්ම කියනවා
  const buttonText = loading
    ? "Processing..."
    : method
      ? `Continue to ${PAY_LABELS[method]}`
      : "Choose a payment method";

  const methods = Object.keys(PAY_LABELS) as PayMethod[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1
        className="font-display text-2xl font-bold"
        style={{ color: "var(--color-ink)" }}
      >
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]"
      >
        {/* Left: Customer details + Address + Payment method */}
        <div className="flex flex-col gap-8">
          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--color-ink)" }}
            >
              Customer Details
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--color-ink)" }}
            >
              Delivery Address
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Street Address
                </label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  City
                </label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Postal Code
                </label>
                <input
                  required
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Province
                </label>
                <input
                  required
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  Special Note (optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ===== ගෙවීම් ක්‍රමය තෝරන කොටස ===== */}
          {/* ref={paymentRef}: ක්‍රමයක් නොතෝරා submit කළාම මෙතැනට scroll වෙනවා */}
          <div ref={paymentRef}>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--color-ink)" }}
            >
              Payment Method
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {methods.map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                  style={{
                    borderColor:
                      method === m ? "var(--color-brand)" : "var(--color-line)",
                    background:
                      method === m ? "rgba(27, 67, 50, 0.05)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={method === m}
                    onChange={() => {
                      setMethod(m);
                      setMethodError("");
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span
                      className="block text-sm font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {PAY_LABELS[m]}
                    </span>
                    <span
                      className="block text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {PAY_DESCRIPTIONS[m]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {methodError && (
              <p className="mt-2 text-sm" style={{ color: "#b91c1c" }}>
                {methodError}
              </p>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div
          className="h-fit rounded-lg border p-6"
          style={{ borderColor: "var(--color-line)" }}
        >
          <h2
            className="font-display text-lg font-bold"
            style={{ color: "var(--color-ink)" }}
          >
            Order Summary
          </h2>

          {method && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Payment: {PAY_LABELS[method]}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {checkoutItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between text-sm"
              >
                <span style={{ color: "var(--color-muted)" }}>
                  {product.name} × {quantity}
                </span>
                <span style={{ color: "var(--color-ink)" }}>
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 flex items-center justify-between border-t pt-4 text-sm"
            style={{ borderColor: "var(--color-line)" }}
          >
            <span style={{ color: "var(--color-muted)" }}>Delivery</span>
            <span style={{ color: "var(--color-ink)" }}>
              {formatPrice(DELIVERY_FEE)}
            </span>
          </div>
          <div
            className="mt-2 flex items-center justify-between border-t pt-4 text-base font-bold"
            style={{
              borderColor: "var(--color-line)",
              color: "var(--color-ink)",
            }}
          >
            <span>Total</span>
            <span>{formatPrice(subtotal + DELIVERY_FEE)}</span>
          </div>

          {/* ක්‍රමයක් තෝරලා නැත්නම් button එක උඩම රතු පණිවිඩය */}
          {methodError && (
            <p className="mt-4 text-sm" style={{ color: "#b91c1c" }}>
              {methodError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--color-brand)" }}
          >
            {buttonText} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
