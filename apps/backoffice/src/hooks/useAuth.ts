import { useCallback, useMemo, useState } from "react";

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
  isAdmin: boolean;
  logout: () => void;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = (parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(payload: JwtPayload): boolean {
  return payload.exp > Math.floor(Date.now() / 1000);
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));

  const user = useMemo((): AuthUser | null => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload || !isTokenValid(payload)) return null;
    return {
      email: payload.email,
      astronaut_id: payload.astronaut_id,
      roles: payload.roles,
      planet_id: payload.planet_id,
    };
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    window.location.href = "/login";
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.roles.includes("admin") ?? false,
    logout,
  };
}
