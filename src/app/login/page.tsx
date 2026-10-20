"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";

// Open redirect nathi karanna: dan site eke path ekak witharai
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (!result.ok) {
      if (result.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(result.message || "Login failed");
      setLoading(false);
      return;
    }
    router.push(safeNext());
    router.refresh();
  };

  const registerHref = (() => {
    if (typeof window === "undefined") return "/register";
    const next = new URLSearchParams(window.location.search).get("next");
    return next ? `/register?next=${encodeURIComponent(next)}` : "/register";
  })();

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1
        className="font-display text-2xl font-bold"
        style={{ color: "var(--color-ink)" }}
      >
        Log in
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
        Welcome back to Deora.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Password
          </label>
          <PasswordInput
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm underline"
              style={{ color: "var(--color-brand)" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--color-brand)" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--color-muted)" }}
      >
        New to Deora?{" "}
        <Link
          href={registerHref}
          className="underline"
          style={{ color: "var(--color-brand)" }}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
