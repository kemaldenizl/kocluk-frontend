"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { isApiError } from "@/lib/api/http-error";
import { profileApi } from "./api";

/** Loads the current user. Does not retry on 401 (the proxy handles auth redirects). */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: profileApi.me,
    retry: (failureCount, error) => (isApiError(error) && error.isUnauthorized ? false : failureCount < 2),
  });
}

/** Updates the current user's identity (name + student type) and refreshes the cache. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
