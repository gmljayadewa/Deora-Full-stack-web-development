"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        setError("Admin account එකකින් login වෙන්න.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Connection error. නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f7f5f0] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e3ded2] bg-white p-7 shadow-sm sm:p-9">
        <Link
          href="/"
          className="text-sm font-semibold text-[#1b4332] hover:underline"
        >
          ← Back to store
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-green-800">
          Deora Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#1b4332]">Admin Login</h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in with your authorised administrator account.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1b4332] px-4 py-3 font-semibold text-white transition hover:bg-[#24563f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
