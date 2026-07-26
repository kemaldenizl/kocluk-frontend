import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Contract tests for the client-side feature API objects. Every call must go through
 * `routeApi` with the exact path, method, query and body the route handlers expect.
 * `routeApi` is mocked so these assert the request contract without any network.
 */

const routeApi = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/api/route-api", () => ({ routeApi }));

beforeEach(() => {
  routeApi.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Convenience: the [path, options] tuple of the most recent routeApi call. */
function lastCall() {
  return routeApi.mock.calls.at(-1)!;
}

describe("authApi", () => {
  it("maps each method to the right route, verb and body", async () => {
    const { authApi } = await import("@/features/auth/api");

    await authApi.register({ email: "a@b.com" } as never);
    expect(lastCall()).toEqual(["/api/auth/register", { method: "POST", body: { email: "a@b.com" } }]);

    await authApi.login({ email: "a@b.com", password: "x" } as never);
    expect(lastCall()[0]).toBe("/api/auth/login");
    expect(lastCall()[1]).toMatchObject({ method: "POST" });

    await authApi.logout();
    expect(lastCall()).toEqual(["/api/auth/logout", { method: "POST" }]);

    await authApi.logoutAll();
    expect(lastCall()).toEqual(["/api/auth/logout-all", { method: "POST" }]);

    await authApi.changeEmailValidate("tok-1");
    expect(lastCall()).toEqual(["/api/auth/change-email/validate", { method: "GET", query: { token: "tok-1" } }]);
  });

  it("covers the remaining POST endpoints", async () => {
    const { authApi } = await import("@/features/auth/api");
    const cases: Array<[() => Promise<unknown>, string]> = [
      [() => authApi.forgotPassword({ email: "a@b.com" } as never), "/api/auth/forgot-password"],
      [() => authApi.resetPassword({} as never), "/api/auth/reset-password"],
      [() => authApi.verifyEmail({ token: "t" } as never), "/api/auth/verify-email"],
      [() => authApi.resendVerification({ email: "a@b.com" } as never), "/api/auth/resend-verification"],
      [() => authApi.changePasswordRequest({} as never), "/api/auth/change-password/request"],
      [() => authApi.changePasswordConfirm({} as never), "/api/auth/change-password/confirm"],
      [() => authApi.changeEmailRequest({} as never), "/api/auth/change-email/request"],
      [() => authApi.changeEmailConfirm({} as never), "/api/auth/change-email/confirm"],
    ];
    for (const [call, path] of cases) {
      await call();
      expect(lastCall()[0]).toBe(path);
      expect(lastCall()[1]).toMatchObject({ method: "POST" });
    }
  });
});

describe("profileApi", () => {
  it("reads and updates the current user", async () => {
    const { profileApi } = await import("@/features/profile/api");

    await profileApi.me();
    expect(lastCall()).toEqual(["/api/users/me"]);

    await profileApi.updateMe({ firstName: "Ada" } as never);
    expect(lastCall()).toEqual(["/api/users/me/update", { method: "PUT", body: { firstName: "Ada" } }]);
  });
});

describe("tenantsApi", () => {
  it("builds list/create and id-scoped lifecycle calls", async () => {
    const { tenantsApi } = await import("@/features/tenants/api");

    await tenantsApi.list();
    expect(lastCall()).toEqual(["/api/tenants"]);

    await tenantsApi.create({ name: "Acme" } as never);
    expect(lastCall()).toEqual(["/api/tenants", { method: "POST", body: { name: "Acme" } }]);

    await tenantsApi.update("t1", { name: "Yeni" } as never);
    expect(lastCall()).toEqual(["/api/tenants/t1", { method: "PUT", body: { name: "Yeni" } }]);

    await tenantsApi.activate("t1");
    expect(lastCall()).toEqual(["/api/tenants/t1/activate", { method: "POST" }]);

    await tenantsApi.deactivate("t1");
    expect(lastCall()).toEqual(["/api/tenants/t1/deactivate", { method: "POST" }]);

    await tenantsApi.remove("t1");
    expect(lastCall()).toEqual(["/api/tenants/t1", { method: "DELETE" }]);
  });
});

describe("rolesApi", () => {
  it("scopes list/create by tenantId and merges tenantId into the create body", async () => {
    const { rolesApi } = await import("@/features/roles/api");

    await rolesApi.list("t1");
    expect(lastCall()).toEqual(["/api/roles", { query: { tenantId: "t1" } }]);

    await rolesApi.create("t1", { name: "Editor" });
    expect(lastCall()).toEqual(["/api/roles", { method: "POST", body: { tenantId: "t1", name: "Editor" } }]);

    await rolesApi.update("r1", { name: "Yeni" });
    expect(lastCall()).toEqual(["/api/roles/r1", { method: "PUT", body: { name: "Yeni" } }]);

    await rolesApi.remove("r1");
    expect(lastCall()).toEqual(["/api/roles/r1", { method: "DELETE" }]);

    await rolesApi.addPermission("r1", "p1");
    expect(lastCall()).toEqual(["/api/roles/r1/permissions", { method: "POST", body: { permissionId: "p1" } }]);

    await rolesApi.removePermission("r1", "p1");
    expect(lastCall()).toEqual(["/api/roles/r1/permissions/p1", { method: "DELETE" }]);
  });
});

describe("membersApi", () => {
  it("carries tenantId as a query param on every tenant-scoped call", async () => {
    const { membersApi } = await import("@/features/members/api");

    await membersApi.list("t1");
    expect(lastCall()).toEqual(["/api/memberships", { query: { tenantId: "t1" } }]);

    await membersApi.myMemberships();
    expect(lastCall()).toEqual(["/api/memberships/me"]);

    await membersApi.add("t1", "a@b.com");
    expect(lastCall()).toEqual(["/api/memberships", { method: "POST", body: { tenantId: "t1", email: "a@b.com" } }]);

    await membersApi.remove("t1", "u1");
    expect(lastCall()).toEqual(["/api/memberships/u1", { method: "DELETE", query: { tenantId: "t1" } }]);

    await membersApi.suspend("t1", "u1");
    expect(lastCall()).toEqual(["/api/memberships/u1/suspend", { method: "POST", query: { tenantId: "t1" } }]);

    await membersApi.reactivate("t1", "u1");
    expect(lastCall()).toEqual(["/api/memberships/u1/reactivate", { method: "POST", query: { tenantId: "t1" } }]);

    await membersApi.grantRole("t1", "u1", "r1");
    expect(lastCall()).toEqual([
      "/api/memberships/u1/roles",
      { method: "POST", query: { tenantId: "t1" }, body: { roleId: "r1" } },
    ]);

    await membersApi.removeRole("t1", "u1", "r1");
    expect(lastCall()).toEqual(["/api/memberships/u1/roles/r1", { method: "DELETE", query: { tenantId: "t1" } }]);
  });
});

describe("permissionsApi", () => {
  it("lists, creates and removes permissions", async () => {
    const { permissionsApi } = await import("@/features/permissions/api");

    await permissionsApi.list();
    expect(lastCall()).toEqual(["/api/permissions"]);

    await permissionsApi.create({ code: "reports.read" });
    expect(lastCall()).toEqual(["/api/permissions", { method: "POST", body: { code: "reports.read" } }]);

    await permissionsApi.remove("p1");
    expect(lastCall()).toEqual(["/api/permissions/p1", { method: "DELETE" }]);
  });
});

describe("sessionsApi", () => {
  it("lists and revokes the current user's sessions", async () => {
    const { sessionsApi } = await import("@/features/sessions/api");

    await sessionsApi.list();
    expect(lastCall()).toEqual(["/api/sessions"]);

    await sessionsApi.revoke("s1");
    expect(lastCall()).toEqual(["/api/sessions/s1", { method: "DELETE" }]);
  });
});
