"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InventoryProduct = {
  id: string;
  name: string;
  image: string | null;
  isActive: boolean;
  category: { name: string } | null;
  stock: number;
};

const LOW_STOCK_LIMIT = 5;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/inventory", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load inventory.");
      }

      const items: InventoryProduct[] = data.products ?? [];

      setProducts(items);
      setQuantities(
        Object.fromEntries(
          items.map((product) => [product.id, String(product.stock)]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        (product.category?.name ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "LOW" && product.stock <= LOW_STOCK_LIMIT) ||
        (filter === "OUT" && product.stock === 0) ||
        (filter === "INACTIVE" && !product.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_LIMIT,
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock === 0,
  ).length;

  async function updateStock(productId: string) {
    setError("");
    setNotice("");

    const quantity = Number(quantities[productId]);

    if (
      quantities[productId]?.trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0 ||
      quantity > 1_000_000
    ) {
      setError("Enter a whole stock quantity from 0 to 1,000,000.");
      return;
    }

    setSavingId(productId);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update stock.");
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? { ...product, stock: quantity } : product,
        ),
      );

      setNotice("Stock updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/admin"
              className="text-sm font-medium text-green-800 hover:underline"
            >
              ← Back to Dashboard
            </a>

            <h1 className="mt-3 text-3xl font-bold">Inventory Management</h1>

            <p className="mt-2 text-sm text-gray-600">
              View product stock and update available quantities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInventory()}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh Inventory
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold">{products.length}</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Low Stock (1–{LOW_STOCK_LIMIT})
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or categories..."
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
            >
              <option value="ALL">All Products</option>
              <option value="LOW">Low Stock</option>
              <option value="OUT">Out of Stock</option>
              <option value="INACTIVE">Inactive Products</option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading inventory...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No matching products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Current Stock</th>
                    <th className="px-5 py-4">New Quantity</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const changed =
                      quantities[product.id] !== String(product.stock);

                    const isSaving = savingId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt=""
                                className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                No image
                              </div>
                            )}

                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {product.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {product.category?.name ?? "Uncategorized"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold">{product.stock}</span>
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            max="1000000"
                            step="1"
                            inputMode="numeric"
                            aria-label={`New stock quantity for ${product.name}`}
                            value={quantities[product.id] ?? ""}
                            onChange={(event) => {
                              setQuantities((current) => ({
                                ...current,
                                [product.id]: event.target.value,
                              }));
                              setNotice("");
                            }}
                            className="w-28 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                          />
                        </td>

                        <td className="px-5 py-4">
                          {product.stock === 0 ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Out of stock
                            </span>
                          ) : product.stock <= LOW_STOCK_LIMIT ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              Low stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                              In stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => void updateStock(product.id)}
                            disabled={!changed || isSaving}
                            className="rounded-lg bg-green-800 px-3 py-2 text-xs font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {isSaving ? "Saving..." : "Update Stock"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
