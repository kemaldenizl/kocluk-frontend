"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { UpdateTenantInput } from "./schemas";
import { tenantsApi } from "./api";

/** Lists all tenants. */
export function useTenants() {
  return useQuery({ queryKey: queryKeys.tenants, queryFn: tenantsApi.list });
}

/**
 * Tenant-scoping state for panels whose data is per-tenant (roles, members). Loads the
 * tenant list and tracks the active selection. The effective tenant is derived during
 * render — defaulting to the first tenant and recovering if the selected one disappears
 * (e.g. deleted) — so no synchronising effect is needed.
 */
export function useTenantScope() {
  const tenants = useTenants();
  const [selected, setSelected] = useState("");

  const list = tenants.data;
  const tenantId = list?.some((t) => t.id === selected) ? selected : list?.[0]?.id ?? "";

  return { tenants, tenantId, setTenantId: setSelected };
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
