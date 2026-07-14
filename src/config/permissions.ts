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
  /**
   * Forward-looking: tenant endpoints are NOT permission-checked server-side today
   * (frontend_guide §10 — the gateway forwards them as-is). They are gated in the UI
   * for now; these codes are wired so backend enforcement can be switched on later
   * without touching the UI. See {@link canReadTenants}/{@link canManageTenants}.
   */
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

/**
 * Tenant capabilities. Until the backend enforces tenant authz, any admin may
 * read/manage tenants; once `tenants.*` permissions are granted the explicit check
 * takes over transparently.
 */
export const canReadTenants = (p: readonly string[]) => hasPermission(p, PERMISSIONS.tenantsRead) || isAdmin(p);
export const canManageTenants = (p: readonly string[]) => hasPermission(p, PERMISSIONS.tenantsManage) || isAdmin(p);
