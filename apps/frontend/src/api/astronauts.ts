import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Astronaut } from "./types";

export function useAstronauts(planetId?: number) {
  const params = planetId !== undefined ? `?planet_id=${planetId}` : "";
  return useQuery({
    queryKey: ["astronauts", planetId ?? "all"],
    queryFn: () => apiClient.get<Astronaut[]>(`/astronauts${params}`),
  });
}

export function useAstronaut(id: number) {
  return useQuery({
    queryKey: ["astronauts", id],
    queryFn: () => apiClient.get<Astronaut>(`/astronauts/${id}`),
  });
}
