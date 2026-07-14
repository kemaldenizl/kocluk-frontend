"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { UpdateTenantInput } from "./schemas";
import { tenantsApi } from "./api";

/** Lists all tenants. */
export function useTenants() {
  return useQuery({ queryKey: queryKeys.tenants, queryFn: tenantsApi.list });
}

function useTenantMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants }),
  });
}

export function useCreateTenant() {
  return useTenantMutation(tenantsApi.create);
}

export function useUpdateTenant() {
  return useTenantMutation(({ id, input }: { id: string; input: UpdateTenantInput }) =>
    tenantsApi.update(id, input),
  );
}

export function useActivateTenant() {
  return useTenantMutation((id: string) => tenantsApi.activate(id));
}

export function useDeactivateTenant() {
  return useTenantMutation((id: string) => tenantsApi.deactivate(id));
}

export function useDeleteTenant() {
  return useTenantMutation((id: string) => tenantsApi.remove(id));
}
