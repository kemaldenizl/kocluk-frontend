import { routeApi } from "@/lib/api/route-api";
import type { RoleNameInput, UpdateRoleInput } from "./schemas";
import type { RoleResponse } from "./types";

/**
 * Client-side role admin API. Roles are tenant-scoped: listing and creation carry a
 * `tenantId`, while by-id operations (rename/delete/permissions) resolve the tenant
 * server-side from the role. All calls go through our own route handlers.
 */
export const rolesApi = {
  list: (tenantId: string) => routeApi<RoleResponse[]>("/api/roles", { query: { tenantId } }),

  create: (tenantId: string, input: RoleNameInput) =>
    routeApi<RoleResponse>("/api/roles", { method: "POST", body: { tenantId, ...input } }),

  update: (id: string, input: UpdateRoleInput) =>
    routeApi<null>(`/api/roles/${id}`, { method: "PUT", body: input }),

  remove: (id: string) => routeApi<null>(`/api/roles/${id}`, { method: "DELETE" }),

  addPermission: (id: string, permissionId: string) =>
    routeApi<null>(`/api/roles/${id}/permissions`, { method: "POST", body: { permissionId } }),

  removePermission: (id: string, permissionId: string) =>
    routeApi<null>(`/api/roles/${id}/permissions/${permissionId}`, { method: "DELETE" }),
};
