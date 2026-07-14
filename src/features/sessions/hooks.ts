"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { sessionsApi } from "./api";

/** Lists the current user's active sessions. */
export function useSessions() {
  return useQuery({ queryKey: queryKeys.sessions, queryFn: sessionsApi.list });
}

/** Revokes one session and refreshes the list. */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions }),
  });
}
