"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: "CUSTOMER" | "ADMIN";
};

type Result = { ok: boolean; message?: string; code?: string };

type AuthContextType = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<Result>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<Result>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // not JSON
  }
  return { res, data };
}

// Login wela inna user wa DB eken ganna (logged out nam null)
async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string): Promise<Result> => {
    const { res, data } = await post("/api/auth/login", { email, password });
    if (!res.ok)
      return {
        ok: false,
        message: data?.message || "Login failed",
        code: data?.code,
      };
    setUser(await fetchMe());
    return { ok: true };
  };

  const register: AuthContextType["register"] = async (payload) => {
    const { res, data } = await post("/api/auth/register", payload);
    if (!res.ok)
      return { ok: false, message: data?.message || "Registration failed" };
    // Email verify කරනකම් login කරන්නේ නෑ
    return { ok: true };
  };

  const logout = async () => {
    await post("/api/auth/logout");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
