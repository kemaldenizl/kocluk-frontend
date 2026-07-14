import { routeApi } from "@/lib/api/route-api";
import type { CreatePermissionInput } from "./schemas";
import type { PermissionResponse } from "./types";

/** Client-side permission admin API. All calls go through our own route handlers. */
export const permissionsApi = {
  list: () => routeApi<PermissionResponse[]>("/api/permissions"),

  create: (input: CreatePermissionInput) =>
    routeApi<PermissionResponse>("/api/permissions", { method: "POST", body: input }),

  remove: (id: string) => routeApi<null>(`/api/permissions/${id}`, { method: "DELETE" }),
};
