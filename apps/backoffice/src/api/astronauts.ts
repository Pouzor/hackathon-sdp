import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface AstronautOut {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  roles: string[];
  planet_id: number | null;
  total_points: number;
  grade_name: string | null;
}

export interface PlanetOut {
  id: number;
  name: string;
  color_hex: string;
  is_competing: boolean;
  season_score: number;
}

export interface ActivityOut {
  id: number;
  name: string;
  base_points: number;
  category: string;
  is_collaborative: boolean;
  allow_multiple_assignees: boolean;
  is_active: boolean;
}

export interface PointAttributionOut {
  id: number;
  astronaut_id: number;
  activity_id: number;
  points: number;
  comment: string | null;
  first_ever_multiplier_applied: boolean;
  first_season_bonus_applied: boolean;
  awarded_at: string;
  activity_name: string | null;
  astronaut_first_name: string | null;
  astronaut_last_name: string | null;
}

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
