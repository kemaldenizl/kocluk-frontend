import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/features/profile/schemas";
import { createTenantSchema, updateTenantSchema } from "@/features/tenants/schemas";
import { addRolePermissionSchema, updateRoleSchema } from "@/features/roles/schemas";
import { addMemberFormSchema, addMemberSchema, grantMemberRoleSchema } from "@/features/members/schemas";
import { createPermissionSchema } from "@/features/permissions/schemas";

/**
 * Broadens schema coverage beyond admin-schemas.test.ts: profile update, tenant slug
 * transform/limits, role rename & permission grant, member email normalisation, and
 * the permission-code regex edge cases. These schemas are the shared client+server
 * validation contract, so every branch matters.
 */

describe("updateProfileSchema", () => {
  const valid = { firstName: "Ada", lastName: "Yılmaz", studentType: "University" };

  it("accepts a complete valid profile", () => {
    expect(updateProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("requires first and last name", () => {
    expect(updateProfileSchema.safeParse({ ...valid, firstName: "" }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ ...valid, lastName: "" }).success).toBe(false);
  });

  it("rejects names longer than 100 chars", () => {
    expect(updateProfileSchema.safeParse({ ...valid, firstName: "a".repeat(101) }).success).toBe(false);
  });

  it("requires a valid studentType", () => {
    expect(updateProfileSchema.safeParse({ ...valid, studentType: "Nope" }).success).toBe(false);
  });
});

describe("createTenantSchema slug handling", () => {
  it("coerces a blank slug to undefined so the backend derives it", () => {
    const result = createTenantSchema.safeParse({ name: "Acme", slug: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.slug).toBeUndefined();
  });

  it("accepts a valid kebab slug", () => {
    const result = createTenantSchema.safeParse({ name: "Acme", slug: "acme-tr-1" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.slug).toBe("acme-tr-1");
  });

  it("rejects slugs with uppercase, spaces or symbols", () => {
    expect(createTenantSchema.safeParse({ name: "Acme", slug: "Acme" }).success).toBe(false);
    expect(createTenantSchema.safeParse({ name: "Acme", slug: "a b" }).success).toBe(false);
    expect(createTenantSchema.safeParse({ name: "Acme", slug: "a_b" }).success).toBe(false);
  });

  it("rejects an overly long slug", () => {
    expect(createTenantSchema.safeParse({ name: "Acme", slug: "a".repeat(201) }).success).toBe(false);
  });

  it("allows omitting the slug entirely", () => {
    const result = createTenantSchema.safeParse({ name: "Acme" });
    expect(result.success).toBe(true);
  });

  it("requires a name within length limits", () => {
    expect(createTenantSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createTenantSchema.safeParse({ name: "a".repeat(201) }).success).toBe(false);
  });
});

describe("updateTenantSchema", () => {
  it("requires only a valid name", () => {
    expect(updateTenantSchema.safeParse({ name: "Yeni Ad" }).success).toBe(true);
    expect(updateTenantSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("roles schemas", () => {
  it("updateRoleSchema requires a bounded name", () => {
    expect(updateRoleSchema.safeParse({ name: "Editör" }).success).toBe(true);
    expect(updateRoleSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateRoleSchema.safeParse({ name: "a".repeat(201) }).success).toBe(false);
  });

  it("addRolePermissionSchema requires a permissionId", () => {
    expect(addRolePermissionSchema.safeParse({ permissionId: "p1" }).success).toBe(true);
    expect(addRolePermissionSchema.safeParse({ permissionId: "" }).success).toBe(false);
  });
});

describe("members schemas", () => {
  it("addMemberFormSchema trims and validates the email", () => {
    const result = addMemberFormSchema.safeParse({ email: "  a@b.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("a@b.com");
  });

  it("addMemberFormSchema rejects a malformed or empty email", () => {
    expect(addMemberFormSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(addMemberFormSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("addMemberSchema accepts an optional roleIds array", () => {
    expect(addMemberSchema.safeParse({ tenantId: "t1", email: "a@b.com", roleIds: ["r1", "r2"] }).success).toBe(true);
  });

  it("addMemberSchema rejects roleIds containing an empty string", () => {
    expect(addMemberSchema.safeParse({ tenantId: "t1", userId: "u1", roleIds: [""] }).success).toBe(false);
  });

  it("grantMemberRoleSchema requires a roleId", () => {
    expect(grantMemberRoleSchema.safeParse({ roleId: "r1" }).success).toBe(true);
    expect(grantMemberRoleSchema.safeParse({ roleId: "" }).success).toBe(false);
  });
});

describe("createPermissionSchema regex edge cases", () => {
  it("accepts single- and multi-segment area.action codes", () => {
    expect(createPermissionSchema.safeParse({ code: "reports.read" }).success).toBe(true);
    expect(createPermissionSchema.safeParse({ code: "users.manage.extra" }).success).toBe(true);
    expect(createPermissionSchema.safeParse({ code: "a1.b2" }).success).toBe(true);
  });

  it("rejects codes that break the area.action shape", () => {
    expect(createPermissionSchema.safeParse({ code: "reports" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "Reports.Read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "reports." }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: ".read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "1reports.read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "" }).success).toBe(false);
  });

  it("rejects an overly long code", () => {
    expect(createPermissionSchema.safeParse({ code: `a.${"b".repeat(100)}` }).success).toBe(false);
  });
});
