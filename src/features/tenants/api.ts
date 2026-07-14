import { routeApi } from "@/lib/api/route-api";
import type { CreateTenantInput, UpdateTenantInput } from "./schemas";
import type { TenantResponse } from "./types";

/** Client-side tenant admin API. All calls go through our own route handlers. */
export const tenantsApi = {
  list: () => routeApi<TenantResponse[]>("/api/tenants"),

  create: (input: CreateTenantInput) =>
    routeApi<TenantResponse>("/api/tenants", { method: "POST", body: input }),

  update: (id: string, input: UpdateTenantInput) =>
    routeApi<null>(`/api/tenants/${id}`, { method: "PUT", body: input }),

  activate: (id: string) => routeApi<null>(`/api/tenants/${id}/activate`, { method: "POST" }),

  deactivate: (id: string) => routeApi<null>(`/api/tenants/${id}/deactivate`, { method: "POST" }),

  remove: (id: string) => routeApi<null>(`/api/tenants/${id}`, { method: "DELETE" }),
};
