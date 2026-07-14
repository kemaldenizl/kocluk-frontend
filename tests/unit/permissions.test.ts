import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  canManageRoles,
  canManageTenants,
  canReadRoles,
  canReadTenants,
  isAdmin,
} from "@/config/permissions";

describe("permission helpers", () => {
  it("treats a user with any admin permission as admin", () => {
    expect(isAdmin([PERMISSIONS.rolesRead])).toBe(true);
    expect(isAdmin([PERMISSIONS.permissionsManage])).toBe(true);
  });

  it("treats a user with no admin permissions as non-admin", () => {
    expect(isAdmin([])).toBe(false);
    expect(isAdmin(["something.else"])).toBe(false);
  });

  it("gates roles read/manage on the exact permission", () => {
    expect(canReadRoles([PERMISSIONS.rolesRead])).toBe(true);
    expect(canManageRoles([PERMISSIONS.rolesRead])).toBe(false);
    expect(canManageRoles([PERMISSIONS.rolesManage])).toBe(true);
  });

  it("lets any admin manage tenants until tenant authz exists, but not a non-admin", () => {
    // No explicit tenants.* permission yet — an admin still gets access.
    expect(canReadTenants([PERMISSIONS.rolesRead])).toBe(true);
    expect(canManageTenants([PERMISSIONS.rolesRead])).toBe(true);
    // A user with no admin permission is denied.
    expect(canManageTenants([])).toBe(false);
    // Explicit future permission also works.
    expect(canManageTenants([PERMISSIONS.tenantsManage])).toBe(true);
  });
});
