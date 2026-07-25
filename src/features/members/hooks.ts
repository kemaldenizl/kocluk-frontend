"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { membersApi } from "./api";

/** Lists a tenant's members. Disabled until a tenant is chosen. */
export function useMembers(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.members(tenantId),
    queryFn: () => membersApi.list(tenantId),
    enabled: tenantId.length > 0,
  });
}

/** The current user's own memberships across tenants (including history). */
export function useMyMemberships() {
  return useQuery({ queryKey: queryKeys.myMemberships, queryFn: membersApi.myMemberships });
}

/** Shares invalidation of the active tenant's member list across every mutation. */
function useMemberMutation<TVars>(tenantId: string, fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members(tenantId) }),
  });
}

export function useAddMember(tenantId: string) {
  return useMemberMutation(tenantId, (email: string) => membersApi.add(tenantId, email));
}

export function useRemoveMember(tenantId: string) {
  return useMemberMutation(tenantId, (userId: string) => membersApi.remove(tenantId, userId));
}

export function useSuspendMember(tenantId: string) {
  return useMemberMutation(tenantId, (userId: string) => membersApi.suspend(tenantId, userId));
}

export function useReactivateMember(tenantId: string) {
  return useMemberMutation(tenantId, (userId: string) => membersApi.reactivate(tenantId, userId));
}

export function useGrantMemberRole(tenantId: string) {
  return useMemberMutation(tenantId, ({ userId, roleId }: { userId: string; roleId: string }) =>
    membersApi.grantRole(tenantId, userId, roleId),
  );
}

export function useRemoveMemberRole(tenantId: string) {
  return useMemberMutation(tenantId, ({ userId, roleId }: { userId: string; roleId: string }) =>
    membersApi.removeRole(tenantId, userId, roleId),
  );
}
