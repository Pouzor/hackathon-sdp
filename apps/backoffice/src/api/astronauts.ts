import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { AstronautOut, PlanetOut, ActivityOut, PointAttributionOut } from "shared-types";

export type { AstronautOut, PlanetOut, ActivityOut, PointAttributionOut };

export function useAstronauts() {
  return useQuery<AstronautOut[]>({
    queryKey: ["admin", "astronauts"],
    queryFn: () => apiClient.get<AstronautOut[]>("/astronauts"),
  });
}

export function usePlanets() {
  return useQuery<PlanetOut[]>({
    queryKey: ["admin", "planets"],
    queryFn: () => apiClient.get<PlanetOut[]>("/planets"),
  });
}

export function useActivities() {
  return useQuery<ActivityOut[]>({
    queryKey: ["admin", "activities"],
    queryFn: () => apiClient.get<ActivityOut[]>("/activities"),
  });
}

export function useUpdateRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      apiClient.patch<AstronautOut>(`/astronauts/${id}/roles`, { roles }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}

export function useUpdateAstronaut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }: { id: number; planet_id?: number | null; hire_date?: string | null; first_name?: string; last_name?: string }) =>
      apiClient.patch<AstronautOut>(`/astronauts/${id}`, fields),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}

export function useCreateAttribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { astronaut_ids: number[]; activity_id: number; points?: number; comment?: string }) =>
      apiClient.post<PointAttributionOut[]>("/point-attributions", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}
