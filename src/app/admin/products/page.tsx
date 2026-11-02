"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  ingredients?: string;
  usage?: string;
  price: number | string;
  image?: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  inventory?: { quantity: number } | null;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  ingredients: string;
  usage: string;
  stock: string;
};

const initialForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "",
  ingredients: "",
  usage: "",
  stock: "0",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);

      if (!productsResponse.ok || !categoriesResponse.ok) {
        if (
          [401, 403].includes(productsResponse.status) ||
          [401, 403].includes(categoriesResponse.status)
        ) {
          throw new Error(
            "Your admin session has expired or you do not have permission. Please log in again.",
          );
        }

        throw new Error(
          "Unable to load products or categories. Please try again.",
        );
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "ALL" || product.categoryId === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && product.isActive) ||
        (statusFilter === "INACTIVE" && !product.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.length - activeCount;

  function openAddModal() {
    setEditingId(null);
    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ?? "",
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      categoryId: product.categoryId,
      image: product.image ?? "",
      ingredients: product.ingredients ?? "",
      usage: product.usage ?? "",
      stock: String(product.inventory?.quantity ?? 0),
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function updateField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price greater than zero.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (form.description.length > 10000) {
      setError("Description cannot exceed 10,000 characters.");
      return;
    }

    if (
      !editingId &&
      (!Number.isInteger(stock) || stock < 0 || stock > 1000000)
    ) {
      setError("Stock must be a whole number between 0 and 1,000,000.");
      return;
    }

    if (form.image.trim()) {
      try {
        const imageUrl = new URL(form.image.trim());

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid image protocol.");
        }
      } catch {
        setError("Please enter a valid HTTP or HTTPS image URL.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId,
        image: form.image.trim(),
        ingredients: form.ingredients.trim(),
        usage: form.usage.trim(),
        ...(!editingId ? { stock, isActive: true } : {}),
      };

      const response = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Failed to save product (HTTP ${response.status}).`,
        );
      }

      setModalOpen(false);
      setNotice(
        editingId
          ? "Product updated successfully."
          : "Product created successfully.",
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save the product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(product: Product) {
    const action = product.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(`Are you sure you want to ${action} "${product.name}"?`)
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Failed to update product status (HTTP ${response.status}).`,
        );
      }

      setNotice(
        product.isActive
          ? "Product deactivated successfully."
          : "Product activated successfully.",
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product status.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F1] px-4 py-8 text-gray-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/admin"
              className="mb-3 inline-block text-sm font-medium text-[#367653] hover:underline"
            >
              ← Admin Dashboard
            </a>

            <h1 className="text-3xl font-bold tracking-tight text-[#1B4332]">
              Products Management
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Manage products, pricing, descriptions, and store visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            disabled={categories.length === 0}
            className="rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#367653] disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Product
          </button>
        </header>

        {categories.length === 0 && !loading && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No categories are available. Create a category before adding
            products.
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-[#1B4332]">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Inactive Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-500">
              {inactiveCount}
            </p>
          </div>
        </section>

        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => void loadData()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {notice}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 md:grid-cols-[1fr_220px_180px]">
            <input
              aria-label="Search products"
              className={inputClass}
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by category"
              className={inputClass}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              className={inputClass}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-gray-700">No products found.</p>
              <p className="mt-2 text-sm text-gray-500">
                Change your search or filters, or add a new product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F7F7F1] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFE8] text-lg text-[#367653]">
                              D
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.category?.name ??
                          categories.find(
                            (category) => category.id === product.categoryId,
                          )?.name ??
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#1B4332]">
                        Rs.{" "}
                        {Number(product.price).toLocaleString("en-LK", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-4">
                        {product.inventory?.quantity ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="font-semibold text-[#367653] hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void toggleStatus(product)}
                            className={`font-semibold hover:underline ${
                              product.isActive
                                ? "text-red-600"
                                : "text-green-700"
                            }`}
                          >
                            {product.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </section>

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setModalOpen(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              className="my-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="product-modal-title"
                    className="text-2xl font-bold text-[#1B4332]"
                  >
                    {editingId ? "Edit Product" : "Add Product"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter detailed product information in English and Sinhala.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={saveProduct} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                    <input
                      required
                      maxLength={150}
                      className={`mt-2 ${inputClass}`}
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                    <select
                      required
                      className={`mt-2 ${inputClass}`}
                      value={form.categoryId}
                      onChange={(event) =>
                        updateField("categoryId", event.target.value)
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    Price (LKR) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={`mt-2 ${inputClass}`}
                      value={form.price}
                      onChange={(event) =>
                        updateField("price", event.target.value)
                      }
                    />
                  </label>

                  {!editingId && (
                    <label className="block text-sm font-medium text-gray-700">
                      Initial Stock *
                      <input
                        required
                        type="number"
                        min="0"
                        max="1000000"
                        step="1"
                        className={`mt-2 ${inputClass}`}
                        value={form.stock}
                        onChange={(event) =>
                          updateField("stock", event.target.value)
                        }
                      />
                    </label>
                  )}

                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Image URL
                    <input
                      type="url"
                      className={`mt-2 ${inputClass}`}
                      placeholder="https://example.com/product-image.jpg"
                      value={form.image}
                      onChange={(event) =>
                        updateField("image", event.target.value)
                      }
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Product Description (Sinhala & English)
                    <textarea
                      rows={10}
                      maxLength={10000}
                      className={`mt-2 ${inputClass} min-h-64 resize-y leading-7`}
                      placeholder={`Write the Sinhala description here...

Write the English description here...

Recommended details:
• Product overview and key features
• Ingredients and product composition
• Product size or net weight
• Recommended usage and preparation
• Storage instructions and shelf-life information
• Packaging and other relevant details

Use accurate, verified product information in both languages.`}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                    />
                    <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Supports Sinhala and English. Maximum 10,000 characters.
                      </span>
                      <span className="font-medium tabular-nums">
                        {form.description.length.toLocaleString()} / 10,000
                        characters
                      </span>
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Ingredients
                    <textarea
                      rows={4}
                      maxLength={5000}
                      className={`mt-2 ${inputClass} resize-y leading-7`}
                      placeholder={`Ingredients (English):

අමුද්‍රව්‍ය (සිංහල):`}
                      value={form.ingredients}
                      onChange={(event) =>
                        updateField("ingredients", event.target.value)
                      }
                    />
                    <span className="mt-1 block text-right text-xs text-gray-500">
                      {form.ingredients.length.toLocaleString()} / 5,000
                      characters
                    </span>
                  </label>

                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Usage Instructions
                    <textarea
                      rows={4}
                      maxLength={5000}
                      className={`mt-2 ${inputClass} resize-y leading-7`}
                      placeholder={`How to use (English):

භාවිතා කරන ආකාරය (සිංහල):`}
                      value={form.usage}
                      onChange={(event) =>
                        updateField("usage", event.target.value)
                      }
                    />
                    <span className="mt-1 block text-right text-xs text-gray-500">
                      {form.usage.length.toLocaleString()} / 5,000 characters
                    </span>
                  </label>
                </div>

                {editingId && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Stock cannot be changed here. Update it separately in
                    Inventory Management.
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || categories.length === 0}
                    className="rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white hover:bg-[#367653] disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Create Product"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
