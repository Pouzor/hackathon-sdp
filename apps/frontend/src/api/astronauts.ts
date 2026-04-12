import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Astronaut } from "./types";

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
