import type { Product } from "@/lib/products";

export type PayMethod = "WHATSAPP" | "COD" | "CARD" | "BANK";

export const PAY_LABELS: Record<PayMethod, string> = {
  WHATSAPP: "WhatsApp Order",
  COD: "Cash on Delivery",
  CARD: "Card Payment",
  BANK: "Bank Transfer",
};

export const PAY_DESCRIPTIONS: Record<PayMethod, string> = {
  WHATSAPP: "Send your order details directly to the shop on WhatsApp.",
  COD: "Place the order now and pay when it is delivered.",
  CARD: "Pay online securely before your order is confirmed.",
  BANK: "Place the order now and send the payment using the bank details provided.",
};

const KEY = "deora-buy-now";

export function saveBuyNow(product: Product, quantity: number) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ product, quantity }));
  } catch {
    // storage blocked
  }
}

export function loadBuyNow(): { product: Product; quantity: number } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBuyNow() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
