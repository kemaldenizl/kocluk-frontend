"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { RoleNameInput, UpdateRoleInput } from "./schemas";
import { rolesApi } from "./api";

/**
 * Lists a tenant's roles with their permissions. Disabled until a tenant is chosen,
 * so the panel can render its selector before any fetch happens.
 */
export function useRoles(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.roles(tenantId),
    queryFn: () => rolesApi.list(tenantId),
    enabled: tenantId.length > 0,
  });
}

/** Shares invalidation of the active tenant's role list across every mutation. */
function useRoleMutation<TVars>(tenantId: string, fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles(tenantId) }),
  });
}

export function useCreateRole(tenantId: string) {
  return useRoleMutation(tenantId, (input: RoleNameInput) => rolesApi.create(tenantId, input));
}

export function useUpdateRole(tenantId: string) {
  return useRoleMutation(tenantId, ({ id, input }: { id: string; input: UpdateRoleInput }) =>
    rolesApi.update(id, input),
  );
}

export function useDeleteRole(tenantId: string) {
  return useRoleMutation(tenantId, (id: string) => rolesApi.remove(id));
}

export function useAddRolePermission(tenantId: string) {
  return useRoleMutation(tenantId, ({ id, permissionId }: { id: string; permissionId: string }) =>
    rolesApi.addPermission(id, permissionId),
  );
}

export function useRemoveRolePermission(tenantId: string) {
  return useRoleMutation(tenantId, ({ id, permissionId }: { id: string; permissionId: string }) =>
    rolesApi.removePermission(id, permissionId),
  );
}
