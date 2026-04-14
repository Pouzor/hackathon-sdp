import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type EventOut = {
  id: number;
  name: string;
  event_date: string;
  created_by: number | null;
  created_at: string;
};

export type AttendanceResult = {
  event_id: number;
  recorded: number;
  already_present: number;
  attributions_created: number;
};

export type SeniorityConfigOut = {
  id: number;
  points_per_year: number;
};

export function useEvents() {
  return useQuery<EventOut[]>({
    queryKey: ["admin", "events"],
    queryFn: () => apiClient.get<EventOut[]>("/events"),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; event_date: string }) =>
      apiClient.post<EventOut>("/events", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
}

export function useEventAttendances(eventId: number) {
  return useQuery<number[]>({
    queryKey: ["admin", "events", eventId, "attendance"],
    queryFn: () => apiClient.get<number[]>(`/events/${eventId}/attendance`),
    enabled: eventId > 0,
  });
}

export function useRecordAttendance(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      astronaut_ids: number[];
      points?: number;
      comment?: string;
    }) => apiClient.post<AttendanceResult>(`/events/${eventId}/attendance`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "astronauts"] });
      void qc.invalidateQueries({ queryKey: ["admin", "events", eventId, "attendance"] });
    },
  });
}

export function useSeniorityConfig() {
  return useQuery<SeniorityConfigOut>({
    queryKey: ["admin", "config", "seniority"],
    queryFn: () => apiClient.get<SeniorityConfigOut>("/config/seniority"),
  });
}

export function useUpdateSeniorityConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { points_per_year: number }) =>
      apiClient.put("/config/seniority", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "config", "seniority"] });
    },
  });
}
