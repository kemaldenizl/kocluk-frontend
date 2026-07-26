import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the authenticated route handlers that proxy through
 * callBackendWithAuth. An in-memory cookie store supplies the access token and the
 * backend fetch is stubbed, so we assert the exact backend path/method built for
 * each handler, tenantId query allow-listing, dynamic params, and body validation.
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

function ok(body: unknown = { ok: true }, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

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

describe("GET /api/users/me", () => {
  it("calls the backend with the bearer token and forwards the body", async () => {
    const fetchMock = stubFetch(ok({ id: "u1", email: "a@b.com" }));
    const { GET } = await import("@/app/api/users/me/route");

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "u1", email: "a@b.com" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/users/me");
    expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer acc");
  });
});

describe("PUT /api/users/me/update", () => {
  const valid = { firstName: "Ada", lastName: "Yılmaz", studentType: "University" };

  it("validates then forwards the update as a PUT", async () => {
    const fetchMock = stubFetch(ok({ id: "u1" }));
    const { PUT } = await import("@/app/api/users/me/update/route");

    const res = await PUT(jsonRequest("http://localhost/api/users/me/update", "PUT", valid));

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/users/me/update");
    expect(init!.method).toBe("PUT");
  });

  it("400s an invalid body without calling the backend", async () => {
    const fetchMock = stubFetch(ok());
    const { PUT } = await import("@/app/api/users/me/update/route");

    const res = await PUT(jsonRequest("http://localhost/api/users/me/update", "PUT", { ...valid, firstName: "" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("/api/roles", () => {
  it("GET forwards only the allow-listed tenantId query param", async () => {
    const fetchMock = stubFetch(ok([]));
    const { GET } = await import("@/app/api/roles/route");

    await GET(new Request("http://localhost/api/roles?tenantId=t1&evil=1"));

    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/roles?tenantId=t1");
  });

  it("POST validates the create payload and forwards it", async () => {
    const fetchMock = stubFetch(ok({ id: "r1" }, 201));
    const { POST } = await import("@/app/api/roles/route");

    const res = await POST(jsonRequest("http://localhost/api/roles", "POST", { tenantId: "t1", name: "Editor" }));

    expect(res.status).toBe(201);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/roles");
    expect(init!.method).toBe("POST");
  });

  it("POST 400s when the tenant is missing", async () => {
    const fetchMock = stubFetch(ok());
    const { POST } = await import("@/app/api/roles/route");

    const res = await POST(jsonRequest("http://localhost/api/roles", "POST", { name: "Editor" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("/api/memberships", () => {
  it("GET forwards the tenantId query param", async () => {
    const fetchMock = stubFetch(ok([]));
    const { GET } = await import("@/app/api/memberships/route");

    await GET(new Request("http://localhost/api/memberships?tenantId=t1"));

    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/memberships?tenantId=t1");
  });

  it("POST 400s when neither email nor userId is provided", async () => {
    const fetchMock = stubFetch(ok());
    const { POST } = await import("@/app/api/memberships/route");

    const res = await POST(jsonRequest("http://localhost/api/memberships", "POST", { tenantId: "t1" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POST forwards a valid add-by-email payload", async () => {
    const fetchMock = stubFetch(ok({ id: "m1" }, 201));
    const { POST } = await import("@/app/api/memberships/route");

    const res = await POST(jsonRequest("http://localhost/api/memberships", "POST", { tenantId: "t1", email: "a@b.com" }));

    expect(res.status).toBe(201);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/memberships");
  });
});

describe("/api/tenants/[id]", () => {
  it("GET builds the id-scoped backend path", async () => {
    const fetchMock = stubFetch(ok({ id: "t1" }));
    const { GET } = await import("@/app/api/tenants/[id]/route");

    await GET(new Request("http://localhost/api/tenants/t1"), ctx({ id: "t1" }));

    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/tenants/t1");
  });

  it("PUT validates then forwards the rename", async () => {
    const fetchMock = stubFetch(ok({ id: "t1" }));
    const { PUT } = await import("@/app/api/tenants/[id]/route");

    const res = await PUT(jsonRequest("http://localhost/api/tenants/t1", "PUT", { name: "Yeni" }), ctx({ id: "t1" }));

    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]!.method).toBe("PUT");
  });

  it("PUT 400s an empty name", async () => {
    const fetchMock = stubFetch(ok());
    const { PUT } = await import("@/app/api/tenants/[id]/route");

    const res = await PUT(jsonRequest("http://localhost/api/tenants/t1", "PUT", { name: "" }), ctx({ id: "t1" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("DELETE forwards a DELETE to the id-scoped path", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { DELETE } = await import("@/app/api/tenants/[id]/route");

    const res = await DELETE(new Request("http://localhost/api/tenants/t1"), ctx({ id: "t1" }));

    expect(res.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/tenants/t1");
    expect(init!.method).toBe("DELETE");
  });
});

describe("POST /api/tenants/[id]/activate", () => {
  it("POSTs to the activate sub-path", async () => {
    const fetchMock = stubFetch(ok({ id: "t1", active: true }));
    const { POST } = await import("@/app/api/tenants/[id]/activate/route");

    await POST(new Request("http://localhost/api/tenants/t1/activate"), ctx({ id: "t1" }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/tenants/t1/activate");
    expect(init!.method).toBe("POST");
  });
});

describe("POST /api/roles/[id]/permissions", () => {
  it("validates the permissionId then forwards to the role's permissions path", async () => {
    const fetchMock = stubFetch(ok({ ok: true }, 201));
    const { POST } = await import("@/app/api/roles/[id]/permissions/route");

    const res = await POST(
      jsonRequest("http://localhost/api/roles/r1/permissions", "POST", { permissionId: "p1" }),
      ctx({ id: "r1" }),
    );

    expect(res.status).toBe(201);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/roles/r1/permissions");
  });

  it("400s a missing permissionId", async () => {
    const fetchMock = stubFetch(ok());
    const { POST } = await import("@/app/api/roles/[id]/permissions/route");

    const res = await POST(
      jsonRequest("http://localhost/api/roles/r1/permissions", "POST", { permissionId: "" }),
      ctx({ id: "r1" }),
    );

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/memberships/[userId]/roles/[roleId]", () => {
  it("builds the nested path and forwards the tenantId query param", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { DELETE } = await import("@/app/api/memberships/[userId]/roles/[roleId]/route");

    const res = await DELETE(
      new Request("http://localhost/api/memberships/u1/roles/r1?tenantId=t1"),
      ctx({ userId: "u1", roleId: "r1" }),
    );

    expect(res.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/memberships/u1/roles/r1?tenantId=t1");
    expect(init!.method).toBe("DELETE");
  });
});

describe("DELETE /api/sessions/[id]", () => {
  it("forwards a DELETE to the id-scoped session path", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { DELETE } = await import("@/app/api/sessions/[id]/route");

    const res = await DELETE(new Request("http://localhost/api/sessions/s1"), ctx({ id: "s1" }));

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/sessions/s1");
  });
});
