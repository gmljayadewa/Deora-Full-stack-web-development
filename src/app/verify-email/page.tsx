"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type View = "loading" | "verified" | "error" | "sent";

export default function VerifyEmailPage() {
  const [view, setView] = useState<View>("loading");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [sending, setSending] = useState(false);
  const ran = useRef(false); // dev mode එකේ effect එක දෙපාරක් run වෙන එක නවත්තන්න

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    setEmail(params.get("email") ?? "");

    // token නැත්නම්: register වුණාම එන "email එක check කරන්න" තිරය
    if (!token) {
      setView("sent");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          setView("verified");
        } else {
          setMessage(data?.message || "Could not verify your email.");
          setView("error");
        }
      })
      .catch(() => {
        setMessage("Something went wrong. Please try again.");
        setView("error");
      });
  }, []);

  const resend = async () => {
    if (sending || !email) return;
    setSending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      setResendMsg(data?.message || "Something went wrong.");
    } catch {
      setResendMsg("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const title = { color: "var(--color-ink)" };
  const muted = { color: "var(--color-muted)" };
  const brandBtn = { background: "var(--color-brand)" };

  const resendBlock = (
    <div className="mt-6 flex flex-col gap-3">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border px-4 py-2 text-sm outline-none"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
      />
      <button
        type="button"
        onClick={resend}
        disabled={sending || !email}
        className="rounded-md py-3 text-sm font-semibold text-white disabled:opacity-60"
        style={brandBtn}
      >
        {sending ? "Sending..." : "Resend verification email"}
      </button>
      {resendMsg && (
        <p className="text-sm" style={{ color: "#15803d" }}>
          {resendMsg}
        </p>
      )}
    </div>
  );

  if (view === "loading") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm" style={muted}>
          Verifying your email...
        </p>
      </div>
    );
  }

  if (view === "verified") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold" style={title}>
          Email verified
        </h1>
        <p className="mt-2 text-sm" style={muted}>
          Your account is ready. You can now log in.
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

  if (view === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold" style={title}>
          Verification failed
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#b91c1c" }}>
          {message}
        </p>
        {resendBlock}
        <p className="mt-6 text-sm" style={muted}>
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

  // view === 'sent'
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-bold" style={title}>
        Check your email
      </h1>
      <p className="mt-2 text-sm" style={muted}>
        {email
          ? `We sent a verification link to ${email}. Click it to activate your account.`
          : "Enter your email to get a new verification link."}
      </p>
      {resendBlock}
      <p className="mt-6 text-sm" style={muted}>
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
