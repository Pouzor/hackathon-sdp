// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const BASE_URL: string = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error("VITE_API_URL is not defined — copy .env.example to .env");

// Auth token stored in localStorage per CLAUDE.md §5 (httpOnly cookie migration is future work).
// Centralised here so every fetch goes through one place; no token is ever logged or serialised.
const AUTH_TOKEN_KEY = "auth_token";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const detail: { detail?: string } = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function uploadFile<T>(path: string, body: FormData): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const detail: { detail?: string } = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, body: FormData) => uploadFile<T>(path, body),
};

/** Origine du serveur (sans le path /api/v1) pour résoudre les fichiers statiques. */
const SERVER_ORIGIN = new URL(BASE_URL).origin;

/** Résout une photo_url stockée en BDD vers une URL absolue affichable. */
export function getAvatarUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("/")) return `${SERVER_ORIGIN}${photoUrl}`;
  return photoUrl;
}
