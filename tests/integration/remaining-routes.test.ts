import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration coverage for the remaining authenticated route handlers, so every
 * endpoint in the BFF is exercised at least once: tenant list/create/deactivate,
 * permission list/create/delete, role by-id CRUD, session list, the membership
 * lifecycle (delete/suspend/reactivate/grant-role) with tenantId allow-listing, and
 * the current-password change-request routes.
 */

const cookieStore = new Map<string, { value: string }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => cookieStore.set(name, { value }),
  }),
}));

function stubFetch(response: Response) {
  const fn = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

const okJson = (body: unknown = { ok: true }, status = 200) => new Response(JSON.stringify(body), { status });
const noContent = () => new Response(null, { status: 204 });

function jsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function ctx<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

beforeEach(() => {
  cookieStore.clear();
  cookieStore.set("access_token", { value: "acc" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("/api/tenants (list + create)", () => {
  it("GET forwards to the tenants collection", async () => {
    const fetchMock = stubFetch(okJson([]));
    const { GET } = await import("@/app/api/tenants/route");
    await GET();
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/tenants");
  });

  it("POST validates then creates", async () => {
    const fetchMock = stubFetch(okJson({ id: "t1" }, 201));
    const { POST } = await import("@/app/api/tenants/route");
    const res = await POST(jsonRequest("http://localhost/api/tenants", "POST", { name: "Acme" }));
    expect(res.status).toBe(201);
    expect(fetchMock.mock.calls[0][1]!.method).toBe("POST");
  });

  it("POST 400s a missing name", async () => {
    const fetchMock = stubFetch(okJson());
    const { POST } = await import("@/app/api/tenants/route");
    const res = await POST(jsonRequest("http://localhost/api/tenants", "POST", { name: "" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/tenants/[id]/deactivate", () => {
  it("POSTs to the deactivate sub-path", async () => {
    const fetchMock = stubFetch(okJson({ active: false }));
    const { POST } = await import("@/app/api/tenants/[id]/deactivate/route");
    await POST(new Request("http://localhost/api/tenants/t1/deactivate"), ctx({ id: "t1" }));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/tenants/t1/deactivate");
    expect(init!.method).toBe("POST");
  });
});

describe("/api/permissions", () => {
  it("GET lists permissions", async () => {
    const fetchMock = stubFetch(okJson([]));
    const { GET } = await import("@/app/api/permissions/route");
    await GET();
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/permissions");
  });

  it("POST validates the code then creates", async () => {
    const fetchMock = stubFetch(okJson({ id: "p1" }, 201));
    const { POST } = await import("@/app/api/permissions/route");
    const res = await POST(jsonRequest("http://localhost/api/permissions", "POST", { code: "reports.read" }));
    expect(res.status).toBe(201);
    expect(fetchMock.mock.calls[0][1]!.method).toBe("POST");
  });

  it("POST 400s a malformed code", async () => {
    const fetchMock = stubFetch(okJson());
    const { POST } = await import("@/app/api/permissions/route");
    const res = await POST(jsonRequest("http://localhost/api/permissions", "POST", { code: "Nope" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("DELETE removes an id-scoped permission", async () => {
    const fetchMock = stubFetch(noContent());
    const { DELETE } = await import("@/app/api/permissions/[id]/route");
    const res = await DELETE(new Request("http://localhost/api/permissions/p1"), ctx({ id: "p1" }));
    expect(res.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/permissions/p1");
    expect(init!.method).toBe("DELETE");
  });
});

describe("/api/roles/[id]", () => {
  it("GET fetches the role by id", async () => {
    const fetchMock = stubFetch(okJson({ id: "r1" }));
    const { GET } = await import("@/app/api/roles/[id]/route");
    await GET(new Request("http://localhost/api/roles/r1"), ctx({ id: "r1" }));
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/roles/r1");
  });

  it("PUT validates then renames", async () => {
    const fetchMock = stubFetch(okJson({ id: "r1" }));
    const { PUT } = await import("@/app/api/roles/[id]/route");
    const res = await PUT(jsonRequest("http://localhost/api/roles/r1", "PUT", { name: "Yeni" }), ctx({ id: "r1" }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]!.method).toBe("PUT");
  });

  it("PUT 400s an empty name", async () => {
    const fetchMock = stubFetch(okJson());
    const { PUT } = await import("@/app/api/roles/[id]/route");
    const res = await PUT(jsonRequest("http://localhost/api/roles/r1", "PUT", { name: "" }), ctx({ id: "r1" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("DELETE removes the role", async () => {
    const fetchMock = stubFetch(noContent());
    const { DELETE } = await import("@/app/api/roles/[id]/route");
    const res = await DELETE(new Request("http://localhost/api/roles/r1"), ctx({ id: "r1" }));
    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][1]!.method).toBe("DELETE");
  });
});

describe("DELETE /api/roles/[id]/permissions/[permissionId]", () => {
  it("removes a permission from a role", async () => {
    const fetchMock = stubFetch(noContent());
    const { DELETE } = await import("@/app/api/roles/[id]/permissions/[permissionId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/roles/r1/permissions/p1"),
      ctx({ id: "r1", permissionId: "p1" }),
    );
    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/roles/r1/permissions/p1");
  });
});

describe("GET /api/sessions", () => {
  it("lists the current user's sessions", async () => {
    const fetchMock = stubFetch(okJson([]));
    const { GET } = await import("@/app/api/sessions/route");
    await GET();
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/sessions");
  });
});

describe("GET /api/memberships/me", () => {
  it("lists the current user's own memberships", async () => {
    const fetchMock = stubFetch(okJson([]));
    const { GET } = await import("@/app/api/memberships/me/route");
    await GET();
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/memberships/me");
  });
});

describe("membership lifecycle (tenantId allow-listed)", () => {
  it("DELETE /api/memberships/[userId] forwards tenantId", async () => {
    const fetchMock = stubFetch(noContent());
    const { DELETE } = await import("@/app/api/memberships/[userId]/route");
    const res = await DELETE(new Request("http://localhost/api/memberships/u1?tenantId=t1&x=2"), ctx({ userId: "u1" }));
    expect(res.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/memberships/u1?tenantId=t1");
    expect(init!.method).toBe("DELETE");
  });

  it("POST /api/memberships/[userId]/suspend forwards tenantId", async () => {
    const fetchMock = stubFetch(noContent());
    const { POST } = await import("@/app/api/memberships/[userId]/suspend/route");
    await POST(new Request("http://localhost/api/memberships/u1/suspend?tenantId=t1"), ctx({ userId: "u1" }));
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/memberships/u1/suspend?tenantId=t1");
  });

  it("POST /api/memberships/[userId]/reactivate forwards tenantId", async () => {
    const fetchMock = stubFetch(noContent());
    const { POST } = await import("@/app/api/memberships/[userId]/reactivate/route");
    await POST(new Request("http://localhost/api/memberships/u1/reactivate?tenantId=t1"), ctx({ userId: "u1" }));
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/memberships/u1/reactivate?tenantId=t1");
  });

  it("POST /api/memberships/[userId]/roles validates, forwards tenantId and the body", async () => {
    const fetchMock = stubFetch(okJson({ ok: true }, 201));
    const { POST } = await import("@/app/api/memberships/[userId]/roles/route");
    const res = await POST(
      jsonRequest("http://localhost/api/memberships/u1/roles?tenantId=t1", "POST", { roleId: "r1" }),
      ctx({ userId: "u1" }),
    );
    expect(res.status).toBe(201);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/memberships/u1/roles?tenantId=t1");
    expect(init!.body).toBe(JSON.stringify({ roleId: "r1" }));
  });

  it("POST /api/memberships/[userId]/roles 400s a missing roleId", async () => {
    const fetchMock = stubFetch(okJson());
    const { POST } = await import("@/app/api/memberships/[userId]/roles/route");
    const res = await POST(
      jsonRequest("http://localhost/api/memberships/u1/roles?tenantId=t1", "POST", { roleId: "" }),
      ctx({ userId: "u1" }),
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("current-password change requests (protected, step 1)", () => {
  it("POST /api/auth/change-email/request validates then forwards", async () => {
    const fetchMock = stubFetch(okJson({ ok: true }));
    const { POST } = await import("@/app/api/auth/change-email/request/route");
    const res = await POST(jsonRequest("http://localhost/api/auth/change-email/request", "POST", { currentPassword: "secret" }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/change-email/request");
  });

  it("POST /api/auth/change-email/request 400s a missing password", async () => {
    const fetchMock = stubFetch(okJson());
    const { POST } = await import("@/app/api/auth/change-email/request/route");
    const res = await POST(jsonRequest("http://localhost/api/auth/change-email/request", "POST", { currentPassword: "" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POST /api/auth/change-password/request validates then forwards", async () => {
    const fetchMock = stubFetch(okJson({ ok: true }));
    const { POST } = await import("@/app/api/auth/change-password/request/route");
    const res = await POST(
      jsonRequest("http://localhost/api/auth/change-password/request", "POST", { currentPassword: "secret" }),
    );
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/change-password/request");
  });

  it("POST /api/auth/change-password/request 400s a missing password", async () => {
    const fetchMock = stubFetch(okJson());
    const { POST } = await import("@/app/api/auth/change-password/request/route");
    const res = await POST(
      jsonRequest("http://localhost/api/auth/change-password/request", "POST", { currentPassword: "" }),
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
