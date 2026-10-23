"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "../lib/products";
import { useCart } from "../context/CartContext";
import BuyNowButton from "./BuyNowButton";

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    // padding නෑ, overflow-hidden නිසා පින්තූරයේ කොන් card එකටම කැපෙනවා
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--color-line)" }}
    >
      {/* පින්තූරය: card එකේ මුළු පළලටම */}
      <div className="relative">
        <div
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden"
          style={{ background: "var(--color-surface)" }}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain"
            />
          ) : (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              Image
            </span>
          )}
        </div>
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
        >
          <Heart size={14} style={{ color: "var(--color-muted)" }} />
        </button>
      </div>

      {/* ලියන කොටස සහ buttons: padding මෙතැන */}
      <div className="flex flex-1 flex-col p-3">
        {product.category && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--color-brand)" }}
          >
            {product.category}
          </span>
        )}

        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 h-10 text-sm font-medium"
          style={{ color: "var(--color-ink)" }}
        >
          {product.name}
        </Link>

        {product.rating ? (
          <div className="mt-1 flex items-center gap-1">
            <Star
              size={12}
              fill="var(--color-secondary)"
              style={{ color: "var(--color-secondary)" }}
            />
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {product.rating} ({product.reviewCount ?? 0})
            </span>
          </div>
        ) : null}

        <p
          className="mt-1 text-sm font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto flex gap-2 pt-3">
          <BuyNowButton
            product={product}
            quantity={1}
            className="flex-1 whitespace-nowrap px-2 py-2 text-xs"
          />
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium transition-colors"
            style={{
              background: added ? "var(--color-brand)" : "transparent",
              color: added ? "#fff" : "var(--color-brand)",
              border: "1.5px solid var(--color-brand)",
            }}
          >
            {added ? (
              <>
                <Check size={14} />
                Added
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
