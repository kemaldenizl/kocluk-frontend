import { routeApi } from "@/lib/api/route-api";
import type { Membership, TenantMember } from "./types";

/**
 * Client-side membership admin API. Every tenant-scoped call carries `tenantId` as a
 * query param (frontend_guide §7); all traffic goes through our own route handlers.
 */
export const membersApi = {
  list: (tenantId: string) =>
    routeApi<TenantMember[]>("/api/memberships", { query: { tenantId } }),

  myMemberships: () => routeApi<Membership[]>("/api/memberships/me"),

  add: (tenantId: string, email: string) =>
    routeApi<Membership>("/api/memberships", { method: "POST", body: { tenantId, email } }),

  remove: (tenantId: string, userId: string) =>
    routeApi<null>(`/api/memberships/${userId}`, { method: "DELETE", query: { tenantId } }),

  suspend: (tenantId: string, userId: string) =>
    routeApi<null>(`/api/memberships/${userId}/suspend`, { method: "POST", query: { tenantId } }),

  reactivate: (tenantId: string, userId: string) =>
    routeApi<null>(`/api/memberships/${userId}/reactivate`, { method: "POST", query: { tenantId } }),

  grantRole: (tenantId: string, userId: string, roleId: string) =>
    routeApi<null>(`/api/memberships/${userId}/roles`, { method: "POST", query: { tenantId }, body: { roleId } }),

  removeRole: (tenantId: string, userId: string, roleId: string) =>
    routeApi<null>(`/api/memberships/${userId}/roles/${roleId}`, { method: "DELETE", query: { tenantId } }),
};
