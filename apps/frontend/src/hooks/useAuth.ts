import { useCallback, useMemo } from "react";

const AUTH_TOKEN_KEY = "auth_token";

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

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(payload: JwtPayload): boolean {
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec;
}

export function useAuth(): UseAuthReturn {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

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
    window.location.href = "/login";
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.roles.includes("admin") ?? false,
    logout,
  };
}

export { AUTH_TOKEN_KEY };
