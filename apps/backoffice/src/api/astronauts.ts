import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined ?? "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    ...init,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((detail as { detail?: string }).detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface AstronautOut {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  roles: string[];
  planet_id: number | null;
  total_points: number;
}

export function useAstronauts() {
  return useQuery<AstronautOut[]>({
    queryKey: ["admin", "astronauts"],
    queryFn: () => apiFetch<AstronautOut[]>("/api/v1/astronauts"),
  });
}

export function useUpdateRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      apiFetch<AstronautOut>(`/api/v1/astronauts/${id}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roles }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}
