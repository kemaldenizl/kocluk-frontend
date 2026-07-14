"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { permissionsApi } from "./api";

/**
 * Lists all permissions. `enabled` lets callers (e.g. the roles panel) skip the
 * fetch when the user lacks `permissions.read`.
 */
export function usePermissions(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: permissionsApi.list,
    enabled: options.enabled ?? true,
  });
}

function usePermissionMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.permissions }),
  });
}

export function useCreatePermission() {
  return usePermissionMutation(permissionsApi.create);
}

export function useDeletePermission() {
  return usePermissionMutation((id: string) => permissionsApi.remove(id));
}
