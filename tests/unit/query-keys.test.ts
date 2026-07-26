import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/query/keys";

/**
 * Unit tests for the centralised react-query keys. They guard the cache-invalidation
 * contract: static keys stay stable and factory keys stay tenant-scoped so one
 * tenant's data is never invalidated by another's.
 */

describe("static keys", () => {
  it("exposes the expected stable tuples", () => {
    expect(queryKeys.me).toEqual(["users", "me"]);
    expect(queryKeys.tenants).toEqual(["tenants"]);
    expect(queryKeys.permissions).toEqual(["permissions"]);
    expect(queryKeys.myMemberships).toEqual(["memberships", "me"]);
    expect(queryKeys.sessions).toEqual(["sessions"]);
  });
});

describe("factory keys", () => {
  it("scopes tenant, role, members and roles keys by their id argument", () => {
    expect(queryKeys.tenant("t1")).toEqual(["tenants", "t1"]);
    expect(queryKeys.role("r1")).toEqual(["roles", "detail", "r1"]);
    expect(queryKeys.roles("t1")).toEqual(["roles", "t1"]);
    expect(queryKeys.members("t1")).toEqual(["members", "t1"]);
  });

  it("produces distinct keys for distinct tenants", () => {
    expect(queryKeys.roles("t1")).not.toEqual(queryKeys.roles("t2"));
    expect(queryKeys.members("t1")).not.toEqual(queryKeys.members("t2"));
  });

  it("keeps the roles list key separate from a role detail key", () => {
    expect(queryKeys.roles("x")).not.toEqual(queryKeys.role("x"));
  });
});
