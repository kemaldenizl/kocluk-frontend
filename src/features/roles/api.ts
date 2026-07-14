import { routeApi } from "@/lib/api/route-api";
import type { CreateRoleInput, UpdateRoleInput } from "./schemas";
import type { RoleResponse } from "./types";

/** Client-side role admin API. All calls go through our own route handlers. */
export const rolesApi = {
  list: () => routeApi<RoleResponse[]>("/api/roles"),

  create: (input: CreateRoleInput) =>
    routeApi<RoleResponse>("/api/roles", { method: "POST", body: input }),

  update: (id: string, input: UpdateRoleInput) =>
    routeApi<null>(`/api/roles/${id}`, { method: "PUT", body: input }),

  remove: (id: string) => routeApi<null>(`/api/roles/${id}`, { method: "DELETE" }),

  addPermission: (id: string, permissionId: string) =>
    routeApi<null>(`/api/roles/${id}/permissions`, { method: "POST", body: { permissionId } }),

  removePermission: (id: string, permissionId: string) =>
    routeApi<null>(`/api/roles/${id}/permissions/${permissionId}`, { method: "DELETE" }),
};
