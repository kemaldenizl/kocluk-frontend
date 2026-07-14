/**
 * Centralised react-query keys. Keeping them in one place avoids typos and makes
 * cache invalidation intent explicit across features.
 */
export const queryKeys = {
  me: ["users", "me"] as const,
  tenants: ["tenants"] as const,
  tenant: (id: string) => ["tenants", id] as const,
  roles: ["roles"] as const,
  role: (id: string) => ["roles", id] as const,
  permissions: ["permissions"] as const,
  sessions: ["sessions"] as const,
} as const;
