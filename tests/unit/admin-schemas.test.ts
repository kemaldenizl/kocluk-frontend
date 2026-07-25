import { describe, expect, it } from "vitest";
import { createTenantSchema } from "@/features/tenants/schemas";
import { createPermissionSchema } from "@/features/permissions/schemas";
import { createRoleSchema, roleNameSchema } from "@/features/roles/schemas";
import { addMemberSchema, grantMemberRoleSchema } from "@/features/members/schemas";

describe("tenant schema", () => {
  it("accepts a name with no slug (backend derives it)", () => {
    const result = createTenantSchema.safeParse({ name: "Acme Inc.", slug: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.slug).toBeUndefined();
  });

  it("rejects an invalid slug", () => {
    expect(createTenantSchema.safeParse({ name: "Acme", slug: "Not Valid" }).success).toBe(false);
  });

  it("requires a name", () => {
    expect(createTenantSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("role schema", () => {
  it("requires a name (create form)", () => {
    expect(roleNameSchema.safeParse({ name: "" }).success).toBe(false);
    expect(roleNameSchema.safeParse({ name: "Editor" }).success).toBe(true);
  });

  it("create payload requires a tenant and a name", () => {
    expect(createRoleSchema.safeParse({ name: "Editor" }).success).toBe(false);
    expect(createRoleSchema.safeParse({ tenantId: "", name: "Editor" }).success).toBe(false);
    expect(createRoleSchema.safeParse({ tenantId: "t1", name: "Editor" }).success).toBe(true);
  });
});

describe("membership schema", () => {
  it("requires a tenant and a user identifier", () => {
    expect(addMemberSchema.safeParse({ tenantId: "t1" }).success).toBe(false);
    expect(addMemberSchema.safeParse({ tenantId: "", email: "a@b.com" }).success).toBe(false);
    expect(addMemberSchema.safeParse({ tenantId: "t1", email: "a@b.com" }).success).toBe(true);
    expect(addMemberSchema.safeParse({ tenantId: "t1", userId: "u1" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(addMemberSchema.safeParse({ tenantId: "t1", email: "not-an-email" }).success).toBe(false);
  });

  it("grant role requires a roleId", () => {
    expect(grantMemberRoleSchema.safeParse({ roleId: "" }).success).toBe(false);
    expect(grantMemberRoleSchema.safeParse({ roleId: "r1" }).success).toBe(true);
  });
});

describe("permission schema", () => {
  it("accepts area.action codes", () => {
    expect(createPermissionSchema.safeParse({ code: "reports.read" }).success).toBe(true);
    expect(createPermissionSchema.safeParse({ code: "users.manage.extra" }).success).toBe(true);
  });

  it("rejects malformed codes", () => {
    expect(createPermissionSchema.safeParse({ code: "reports" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "Reports.Read" }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ code: "" }).success).toBe(false);
  });
});
