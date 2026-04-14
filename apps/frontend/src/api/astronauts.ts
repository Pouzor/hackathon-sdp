import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Astronaut, TrophyAttribution } from "./types";

export function useTrophyAttributions(astronautId: number) {
  return useQuery({
    queryKey: ["trophy-attributions", "astronaut", astronautId],
    queryFn: () =>
      apiClient.get<TrophyAttribution[]>(`/trophies/attributions?astronaut_id=${astronautId}`),
    enabled: astronautId > 0,
  });
}

export function usePlanetTrophyAttributions(planetId: number | null) {
  return useQuery({
    queryKey: ["trophy-attributions", "planet", planetId],
    queryFn: () =>
      apiClient.get<TrophyAttribution[]>(`/trophies/attributions?planet_id=${planetId!}`),
    enabled: planetId !== null,
    refetchInterval: 30_000,
  });
}

export interface ProfileUpdatePayload {
  photo_url?: string | null;
  hobbies?: string | null;
  client?: string | null;
}

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

export function useUpdateProfile(astronautId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      apiClient.patch<Astronaut>(`/astronauts/${astronautId}`, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["astronauts", astronautId], updated);
      void qc.invalidateQueries({ queryKey: ["astronauts"] });
    },
  });
}
