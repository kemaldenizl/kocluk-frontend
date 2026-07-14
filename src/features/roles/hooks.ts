"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { UpdateRoleInput } from "./schemas";
import { rolesApi } from "./api";

/** Lists all roles with their permissions. */
export function useRoles() {
  return useQuery({ queryKey: queryKeys.roles, queryFn: rolesApi.list });
}

function useRoleMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles }),
  });
}

export function useCreateRole() {
  return useRoleMutation(rolesApi.create);
}

export function useUpdateRole() {
  return useRoleMutation(({ id, input }: { id: string; input: UpdateRoleInput }) => rolesApi.update(id, input));
}

export function useDeleteRole() {
  return useRoleMutation((id: string) => rolesApi.remove(id));
}

export function useAddRolePermission() {
  return useRoleMutation(({ id, permissionId }: { id: string; permissionId: string }) =>
    rolesApi.addPermission(id, permissionId),
  );
}

export function useRemoveRolePermission() {
  return useRoleMutation(({ id, permissionId }: { id: string; permissionId: string }) =>
    rolesApi.removePermission(id, permissionId),
  );
}
