/** Tenant record from the Tenant service (`GET /api/tenants`). */
export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}
