import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Grade } from "./types";

export function useGrades() {
  return useQuery<Grade[]>({
    queryKey: ["grades"],
    queryFn: () => apiClient.get<Grade[]>("/grades"),
  });
}
