import { describe, expect, it } from "vitest";
import { createTenantSchema } from "@/features/tenants/schemas";
import { createPermissionSchema } from "@/features/permissions/schemas";
import { createRoleSchema } from "@/features/roles/schemas";

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
  it("requires a name", () => {
    expect(createRoleSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createRoleSchema.safeParse({ name: "Editor" }).success).toBe(true);
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
