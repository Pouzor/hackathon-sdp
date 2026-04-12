import { useCallback, useEffect, useMemo, useState } from "react";

// SECURITY TRADE-OFF (CLAUDE.md §5): JWT is stored in localStorage, which is accessible to
// JavaScript and therefore exposed to XSS attacks. This is an accepted risk for this dev phase.
// Migration to httpOnly cookies managed by the backend is planned before production deployment.
export const AUTH_TOKEN_KEY = "auth_token";

interface JwtPayload {
  sub: string;
  email: string;
  astronaut_id: number;
  roles: string[];
  planet_id: number | null;
  exp: number;
}

interface AuthUser {
  email: string;
  astronaut_id: number;
  roles: string[];
  planet_id: number | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // NOTE: isAdmin is derived from the locally-decoded JWT payload (no signature verification).
  // It controls UI rendering only — all admin API endpoints are enforced server-side via the
  // CurrentAdmin dependency in apps/api/src/core/deps.py. A crafted token would be rejected
  // by the backend on every request.
  isAdmin: boolean;
  logout: () => void;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const b64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(payload: JwtPayload): boolean {
  return payload.exp > Math.floor(Date.now() / 1000);
}

function getUserFromStorage(): AuthUser | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || !isTokenValid(payload)) return null;
  return {
    email: payload.email,
    astronaut_id: payload.astronaut_id,
    roles: payload.roles,
    planet_id: payload.planet_id,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(getUserFromStorage);

  // Re-sync when another tab logs out or logs in (storage event fires across tabs, not same tab)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === AUTH_TOKEN_KEY || e.key === null) {
        setUser(getUserFromStorage());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("storage", onStorage); };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const isAdmin = useMemo(() => user?.roles.includes("admin") ?? false, [user]);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin,
    logout,
  };
}
