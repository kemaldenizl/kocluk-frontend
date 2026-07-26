/**
 * Centralised react-query keys. Keeping them in one place avoids typos and makes
 * cache invalidation intent explicit across features.
 */
export const queryKeys = {
  me: ["users", "me"] as const,
  tenants: ["tenants"] as const,
  tenant: (id: string) => ["tenants", id] as const,
  /** Roles are tenant-scoped (frontend_guide §9). */
  roles: (tenantId: string) => ["roles", tenantId] as const,
  role: (id: string) => ["roles", "detail", id] as const,
  permissions: ["permissions"] as const,
  /** Members of a given tenant (frontend_guide §7). */
  members: (tenantId: string) => ["members", tenantId] as const,
  /** The current user's own memberships. */
  myMemberships: ["memberships", "me"] as const,
  sessions: ["sessions"] as const,
  /** Whether the current session's account has MFA enabled (BFF-tracked hint). */
  mfaStatus: ["mfa", "status"] as const,
} as const;
