"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function ForgotPasswordPage() {
  // null = URL eka kiyawala nae. '' = token nae (email form). 'abc..' = token thiyenawa (aluth password form)
  const [token, setToken] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  // Email eka dala "Send reset link"
  const requestLink = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.message || "Something went wrong");
      setMessage(data.message);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Aluth password eka dala "Reset password"
  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.message || "Could not reset password");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Link eka expire unama aye email form ekata yanna
  const backToEmailForm = () => {
    window.history.replaceState(null, "", "/forgot-password");
    setToken("");
    setError("");
  };

  if (token === null) return null;

  const title = { color: "var(--color-ink)" };
  const muted = { color: "var(--color-muted)" };
  const brandBtn = { background: "var(--color-brand)" };

  // ===== Password eka maru wela iwarai =====
  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold" style={title}>
          Password reset
        </h1>
        <p className="mt-2 text-sm" style={muted}>
          Your password was changed. You can now log in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md px-6 py-3 text-sm font-semibold text-white"
          style={brandBtn}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // ===== Link eken awama: aluth password form eka =====
  if (token) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-2xl font-bold" style={title}>
          Choose a new password
        </h1>

        <form onSubmit={resetPassword} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium" style={title}>
              New Password
            </label>
            <PasswordInput
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium" style={title}>
              Confirm New Password
            </label>
            <PasswordInput
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#b91c1c" }}>
              {error}{" "}
              {error.includes("expired") && (
                <button
                  type="button"
                  onClick={backToEmailForm}
                  className="underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Request a new link
                </button>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={brandBtn}
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    );
  }

  // ===== Mulu page eka: email form eka =====
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl font-bold" style={title}>
        Forgot password
      </h1>
      <p className="mt-1 text-sm" style={muted}>
        Enter your email and we will send you a link to set a new password.
      </p>

      <form onSubmit={requestLink} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium" style={title}>
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

        {error && (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm" style={{ color: "#15803d" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={brandBtn}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={muted}>
        <Link
          href="/login"
          className="underline"
          style={{ color: "var(--color-brand)" }}
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
