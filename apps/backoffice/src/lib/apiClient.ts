// Auth token stocké en localStorage — trade-off accepté (CLAUDE.md §5, httpOnly cookie = future work)
import { AUTH_TOKEN_KEY } from "@/hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined ?? "http://localhost:8000/api/v1";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options?.headers },
    ...options,
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = "/login";
    throw new Error("Session expirée — redirection vers /login");
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((detail as { detail?: string }).detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", ...(body ? { body: JSON.stringify(body) } : {}) }),
};
