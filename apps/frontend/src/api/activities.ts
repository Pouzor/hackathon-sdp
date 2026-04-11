import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Activity } from "./types";

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: () => apiClient.get<Activity[]>("/activities"),
  });
}
