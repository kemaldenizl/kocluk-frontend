import { describe, expect, it } from "vitest";
import {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
  canManageMembers,
  canManagePermissions,
  canReadMembers,
  canReadPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/config/permissions";

/**
 * Complements permissions.test.ts: covers the low-level predicates and the
 * member/permission capability helpers (including their admin fallback).
 */

describe("hasPermission / hasAnyPermission", () => {
  it("hasPermission is an exact membership check", () => {
    expect(hasPermission([PERMISSIONS.rolesRead], PERMISSIONS.rolesRead)).toBe(true);
    expect(hasPermission([PERMISSIONS.rolesRead], PERMISSIONS.rolesManage)).toBe(false);
    expect(hasPermission([], PERMISSIONS.rolesRead)).toBe(false);
  });

  it("hasAnyPermission is true when at least one code matches", () => {
    expect(hasAnyPermission([PERMISSIONS.rolesRead], [PERMISSIONS.rolesManage, PERMISSIONS.rolesRead])).toBe(true);
    expect(hasAnyPermission([PERMISSIONS.usersRead], [PERMISSIONS.rolesManage])).toBe(false);
    expect(hasAnyPermission([], [PERMISSIONS.rolesRead])).toBe(false);
    expect(hasAnyPermission([PERMISSIONS.rolesRead], [])).toBe(false);
  });
});

describe("permissions capability helpers", () => {
  it("gates read/manage on the exact permission code", () => {
    expect(canReadPermissions([PERMISSIONS.permissionsRead])).toBe(true);
    expect(canManagePermissions([PERMISSIONS.permissionsRead])).toBe(false);
    expect(canManagePermissions([PERMISSIONS.permissionsManage])).toBe(true);
  });
});

describe("members capability helpers (admin fallback)", () => {
  it("grants access to the explicit member permission holder", () => {
    expect(canReadMembers([PERMISSIONS.membersRead])).toBe(true);
    expect(canManageMembers([PERMISSIONS.membersManage])).toBe(true);
  });

  it("falls back to admin: any admin permission unlocks member read/manage", () => {
    expect(canReadMembers([PERMISSIONS.rolesRead])).toBe(true);
    expect(canManageMembers([PERMISSIONS.rolesRead])).toBe(true);
  });

  it("denies a user with no relevant permission", () => {
    expect(canReadMembers([])).toBe(false);
    expect(canManageMembers(["something.else"])).toBe(false);
  });
});

describe("catalogue integrity", () => {
  it("every ADMIN_PERMISSIONS entry is a real permission code", () => {
    const all = Object.values(PERMISSIONS);
    for (const code of ADMIN_PERMISSIONS) {
      expect(all).toContain(code);
    }
  });

  it("all permission codes follow the area.action shape", () => {
    for (const code of Object.values(PERMISSIONS)) {
      expect(code).toMatch(/^[a-z]+\.[a-z]+$/);
    }
  });
});
