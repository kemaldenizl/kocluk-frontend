/**
 * Permission catalogue + capability helpers. Mirrors the backend permission codes
 * (frontend_guide §3). Authorization is always enforced server-side; these helpers
 * only decide what the UI reveals.
 */

export const PERMISSIONS = {
  usersRead: "users.read",
  usersManage: "users.manage",
  rolesRead: "roles.read",
  rolesManage: "roles.manage",
  permissionsRead: "permissions.read",
  permissionsManage: "permissions.manage",
  sessionsRead: "sessions.read",
  sessionsManage: "sessions.manage",
  /** Tenant-scoped membership management (frontend_guide §7). */
  membersRead: "members.read",
  membersManage: "members.manage",
  /** Tenant lifecycle, enforced server-side by the Tenant service (frontend_guide §11). */
  tenantsRead: "tenants.read",
  tenantsManage: "tenants.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Permissions that grant entry to the admin area at all. */
export const ADMIN_PERMISSIONS: readonly string[] = [
  PERMISSIONS.usersRead,
  PERMISSIONS.usersManage,
  PERMISSIONS.rolesRead,
  PERMISSIONS.rolesManage,
  PERMISSIONS.permissionsRead,
  PERMISSIONS.permissionsManage,
  PERMISSIONS.membersRead,
  PERMISSIONS.membersManage,
  PERMISSIONS.tenantsRead,
  PERMISSIONS.tenantsManage,
];

export function hasPermission(permissions: readonly string[], code: string): boolean {
  return permissions.includes(code);
}

export function hasAnyPermission(permissions: readonly string[], codes: readonly string[]): boolean {
  return codes.some((code) => permissions.includes(code));
}

/** True when the user holds at least one admin-area permission. */
export function isAdmin(permissions: readonly string[]): boolean {
  return hasAnyPermission(permissions, ADMIN_PERMISSIONS);
}

export const canReadRoles = (p: readonly string[]) => hasPermission(p, PERMISSIONS.rolesRead);
export const canManageRoles = (p: readonly string[]) => hasPermission(p, PERMISSIONS.rolesManage);

export const canReadPermissions = (p: readonly string[]) => hasPermission(p, PERMISSIONS.permissionsRead);
export const canManagePermissions = (p: readonly string[]) => hasPermission(p, PERMISSIONS.permissionsManage);

export const canReadMembers = (p: readonly string[]) => hasPermission(p, PERMISSIONS.membersRead) || isAdmin(p);
export const canManageMembers = (p: readonly string[]) => hasPermission(p, PERMISSIONS.membersManage) || isAdmin(p);

/**
 * Tenant & member capabilities are enforced server-side (403 on failure). A platform
 * system administrator bypasses the per-tenant permission checks; because the
 * `/api/users/me` payload exposes only resolved permission codes (not the
 * `system_admin` flag), {@link isAdmin} is used as the UI proxy for that bypass so a
 * broad admin is never hidden from a tab they can actually operate.
 */
export const canReadTenants = (p: readonly string[]) => hasPermission(p, PERMISSIONS.tenantsRead) || isAdmin(p);
export const canManageTenants = (p: readonly string[]) => hasPermission(p, PERMISSIONS.tenantsManage) || isAdmin(p);
