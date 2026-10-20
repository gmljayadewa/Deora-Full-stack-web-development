"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get("next"));
  }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
    });
    if (!result.ok) {
      setError(result.message || "Registration failed");
      setLoading(false);
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  };

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  const textField = (
    label: string,
    key: "name" | "email" | "phone",
    type: string,
    required: boolean,
    autoComplete: string,
  ) => (
    <div>
      <label
        className="text-sm font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        {label}
      </label>
      <input
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
      />
    </div>
  );

  const passwordField = (label: string, key: "password" | "confirm") => (
    <div>
      <label
        className="text-sm font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        {label}
      </label>
      <PasswordInput
        required
        autoComplete="new-password"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1
        className="font-display text-2xl font-bold"
        style={{ color: "var(--color-ink)" }}
      >
        Create your account
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {textField("Full Name", "name", "text", true, "name")}
        {textField("Email", "email", "email", true, "email")}
        {textField("Phone (optional)", "phone", "tel", false, "tel")}
        {passwordField("Password", "password")}
        {passwordField("Confirm Password", "confirm")}

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
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--color-muted)" }}
      >
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="underline"
          style={{ color: "var(--color-brand)" }}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
