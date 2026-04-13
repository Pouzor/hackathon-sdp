import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Planet, PointAttribution } from "./types";

export function usePlanets() {
  return useQuery({
    queryKey: ["planets"],
    queryFn: () => apiClient.get<Planet[]>("/planets"),
  });
}

export function usePlanet(id: number) {
  return useQuery({
    queryKey: ["planets", id],
    queryFn: () => apiClient.get<Planet>(`/planets/${id}`),
  });
}

export function usePlanetContributions(planetId: number | null) {
  return useQuery({
    queryKey: ["point-attributions", "planet", planetId],
    queryFn: () =>
      apiClient.get<PointAttribution[]>(`/point-attributions?planet_id=${String(planetId)}`),
    enabled: planetId !== null,
  });
}
