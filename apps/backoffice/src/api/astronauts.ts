import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  AstronautOut,
  PlanetOut,
  ActivityOut,
  PointAttributionOut,
  SeasonOut,
  GradeOut,
} from "shared-types";

export type { AstronautOut, PlanetOut, ActivityOut, PointAttributionOut, SeasonOut, GradeOut };

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
    mutationFn: ({
      id,
      ...fields
    }: {
      id: number;
      planet_id?: number | null;
      hire_date?: string | null;
      first_name?: string;
      last_name?: string;
    }) => apiClient.patch<AstronautOut>(`/astronauts/${id}`, fields),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}

// ── Planets ──────────────────────────────────────────────────────────────────

export function useUpdatePlanet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }: Partial<PlanetOut> & { id: number }) =>
      apiClient.patch<PlanetOut>(`/planets/${id}`, fields),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "planets"] });
    },
  });
}

// ── Seasons ───────────────────────────────────────────────────────────────────

export function useSeasons() {
  return useQuery<SeasonOut[]>({
    queryKey: ["admin", "seasons"],
    queryFn: () => apiClient.get<SeasonOut[]>("/seasons"),
  });
}

export function useCreateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; start_date: string }) =>
      apiClient.post<SeasonOut>("/seasons", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "seasons"] });
    },
  });
}

export function useActivateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post<SeasonOut>(`/seasons/${id}/activate`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "seasons"] });
    },
  });
}

export function useCloseSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post<SeasonOut>(`/seasons/${id}/close`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "seasons"] });
    },
  });
}

// ── Grades ────────────────────────────────────────────────────────────────────

export function useGrades() {
  return useQuery<GradeOut[]>({
    queryKey: ["admin", "grades"],
    queryFn: () => apiClient.get<GradeOut[]>("/grades"),
  });
}

export function useCreateGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; threshold_points: number; order: number }) =>
      apiClient.post<GradeOut>("/grades", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "grades"] });
    },
  });
}

export function useUpdateGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }: Partial<GradeOut> & { id: number }) =>
      apiClient.patch<GradeOut>(`/grades/${id}`, fields),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "grades"] });
    },
  });
}

export function useDeleteGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/grades/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "grades"] });
    },
  });
}

// ── Activities ────────────────────────────────────────────────────────────────

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      base_points: number;
      category: string;
      is_collaborative: boolean;
      allow_multiple_assignees: boolean;
    }) => apiClient.post<ActivityOut>("/activities", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "activities"] });
    },
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }: Partial<ActivityOut> & { id: number }) =>
      apiClient.patch<ActivityOut>(`/activities/${id}`, fields),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "activities"] });
    },
  });
}

// ── Attributions ──────────────────────────────────────────────────────────────

// ── Trophies ──────────────────────────────────────────────────────────────────

import type { TrophyOut, TrophyAttributionOut } from "shared-types";
export type { TrophyOut, TrophyAttributionOut };

export function useTrophies() {
  return useQuery<TrophyOut[]>({
    queryKey: ["admin", "trophies"],
    queryFn: () => apiClient.get<TrophyOut[]>("/trophies"),
  });
}

export function useCreateTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string | null;
      icon_url?: string | null;
      season_id?: number | null;
    }) => apiClient.post<TrophyOut>("/trophies", body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin", "trophies"] }); },
  });
}

export function useUpdateTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }: Partial<TrophyOut> & { id: number }) =>
      apiClient.patch<TrophyOut>(`/trophies/${id}`, fields),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin", "trophies"] }); },
  });
}

export function useDeleteTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/trophies/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin", "trophies"] }); },
  });
}

export function useCreateTrophyAttribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      trophy_id: number;
      astronaut_id?: number | null;
      planet_id?: number | null;
      comment?: string | null;
    }) => apiClient.post<TrophyAttributionOut>("/trophies/attributions", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "trophies"] });
      void qc.invalidateQueries({ queryKey: ["admin", "attributions"] });
    },
  });
}

export function useDeleteTrophyAttribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/trophies/attributions/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin", "trophies"] }); },
  });
}

export function useAstronautAttributions(astronautId: number | null) {
  return useQuery<PointAttributionOut[]>({
    queryKey: ["admin", "attributions", "astronaut", astronautId],
    queryFn: () =>
      apiClient.get<PointAttributionOut[]>(`/point-attributions?astronaut_id=${astronautId!}`),
    enabled: astronautId !== null,
  });
}

export function useRecentAttributions(limit = 10) {
  return useQuery<PointAttributionOut[]>({
    queryKey: ["admin", "attributions", "recent", limit],
    queryFn: () => apiClient.get<PointAttributionOut[]>(`/point-attributions?limit=${limit}&sort=desc`),
    refetchInterval: 30_000,
  });
}

export function useCreateAttribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      astronaut_ids: number[];
      activity_id: number;
      points?: number;
      comment?: string;
      awarded_at?: string; // ISO 8601, None = now (UTC)
    }) => apiClient.post<PointAttributionOut[]>("/point-attributions", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
    },
  });
}
