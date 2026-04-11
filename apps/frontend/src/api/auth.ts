import { useQuery } from "@tanstack/react-query";

export interface AstronautMe {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  roles: string[];
  planet_id: number | null;
  total_points: number;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMe(): Promise<AstronautMe> {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Non authentifié");
  const BASE_URL = import.meta.env.VITE_API_URL as string;
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur authentification");
  return res.json() as Promise<AstronautMe>;
}

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

