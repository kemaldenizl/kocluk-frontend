import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the public (unauthenticated) auth route handlers. Each one
 * validates the body against its schema then proxies to the backend via serverApi.
 * We stub fetch to assert both the validation gate and the backend forwarding.
 */

function stubFetch(response: Response) {
  const fn = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/auth/register", () => {
  const valid = {
    firstName: "Ada",
    lastName: "Yılmaz",
    email: "user@example.com",
    password: "P@ssw0rd12345",
    confirmPassword: "P@ssw0rd12345",
    studentType: "HighSchool",
  };

  it("forwards a valid registration to the backend and relays its status", async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify({ id: "u1" }), { status: 201 }));
    const { POST } = await import("@/app/api/auth/register/route");

    const res = await POST(jsonRequest("http://localhost/api/auth/register", valid));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "u1" });
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/register");
  });

  it("rejects an invalid body with a 400 and never calls the backend", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 201 }));
    const { POST } = await import("@/app/api/auth/register/route");

    const res = await POST(jsonRequest("http://localhost/api/auth/register", { ...valid, email: "" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("relays a backend validation error verbatim", async () => {
    stubFetch(new Response(JSON.stringify({ title: "Email in use", status: 409 }), { status: 409 }));
    const { POST } = await import("@/app/api/auth/register/route");

    const res = await POST(jsonRequest("http://localhost/api/auth/register", valid));

    expect(res.status).toBe(409);
    expect((await res.json()).title).toBe("Email in use");
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("forwards a valid email", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/forgot-password/route");

    const res = await POST(jsonRequest("http://localhost/api/auth/forgot-password", { email: "a@b.com" }));

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/forgot-password");
  });

  it("400s an empty email without calling the backend", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/forgot-password/route");

    const res = await POST(jsonRequest("http://localhost/api/auth/forgot-password", { email: "" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/reset-password", () => {
  const valid = { token: "t", newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" };

  it("forwards a valid reset", async () => {
    stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(jsonRequest("http://localhost/api/auth/reset-password", valid));
    expect(res.status).toBe(204);
  });

  it("400s mismatched passwords", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(
      jsonRequest("http://localhost/api/auth/reset-password", { ...valid, confirmNewPassword: "different1234" }),
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/verify-email", () => {
  it("forwards a valid token and 400s an empty one", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/verify-email/route");

    expect((await POST(jsonRequest("http://localhost/api/auth/verify-email", { token: "abc" }))).status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const bad = await POST(jsonRequest("http://localhost/api/auth/verify-email", { token: "" }));
    expect(bad.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/auth/resend-verification", () => {
  it("forwards a valid email", async () => {
    stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    expect((await POST(jsonRequest("http://localhost/api/auth/resend-verification", { email: "a@b.com" }))).status).toBe(204);
  });
});

describe("POST /api/auth/change-email/confirm", () => {
  const valid = { token: "t", newEmail: "new@b.com" };

  it("forwards a valid confirm", async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const { POST } = await import("@/app/api/auth/change-email/confirm/route");
    const res = await POST(jsonRequest("http://localhost/api/auth/change-email/confirm", valid));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/change-email/confirm");
  });

  it("400s a missing token", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 200 }));
    const { POST } = await import("@/app/api/auth/change-email/confirm/route");
    expect((await POST(jsonRequest("http://localhost/api/auth/change-email/confirm", { ...valid, token: "" }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/auth/change-email/validate", () => {
  it("400s when the token query param is missing", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 200 }));
    const { GET } = await import("@/app/api/auth/change-email/validate/route");

    const res = await GET(new Request("http://localhost/api/auth/change-email/validate"));

    expect(res.status).toBe(400);
    expect((await res.json()).title).toBe("Geçersiz istek");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the URL-encoded token to the backend validate endpoint", async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify({ valid: true }), { status: 200 }));
    const { GET } = await import("@/app/api/auth/change-email/validate/route");

    const res = await GET(new Request("http://localhost/api/auth/change-email/validate?token=a%2Fb"));

    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/change-email/validate?token=a%2Fb");
  });
});

describe("POST /api/auth/change-password/confirm", () => {
  const valid = { token: "t", newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" };

  it("forwards a valid confirm and 400s a mismatch", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/change-password/confirm/route");

    expect((await POST(jsonRequest("http://localhost/api/auth/change-password/confirm", valid))).status).toBe(204);
    const bad = await POST(
      jsonRequest("http://localhost/api/auth/change-password/confirm", { ...valid, confirmNewPassword: "nope12345678" }),
    );
    expect(bad.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
