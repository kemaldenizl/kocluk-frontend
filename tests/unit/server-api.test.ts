import { afterEach, describe, expect, it, vi } from "vitest";
import { serverApi } from "@/lib/api/server-api";

function mockFetch(response: Response) {
  const fn = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("serverApi", () => {
  it("targets the backend base URL without a tenant header", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await serverApi("/api/users/me");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/users/me");
    const headers = init!.headers as Record<string, string>;
    expect(headers["X-Tenant-Id"]).toBeUndefined();
    expect(headers.Authorization).toBeUndefined();
  });

  it("attaches the bearer token and JSON body for authenticated writes", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    const res = await serverApi("/api/auth/logout", {
      method: "POST",
      body: { a: 1 },
      accessToken: "token-123",
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init!.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer token-123");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init!.body).toBe(JSON.stringify({ a: 1 }));
    // 204 → null data
    expect(res).toEqual({ ok: true, status: 204, data: null });
  });

  it("surfaces the status and parsed problem body on errors without throwing", async () => {
    mockFetch(new Response(JSON.stringify({ title: "Unauthorized", status: 401 }), { status: 401 }));

    const res = await serverApi("/api/users/me", { accessToken: "expired" });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
    expect(res.data).toMatchObject({ status: 401 });
  });

  it("maps a network failure to a 503 problem response", async () => {
    const fn = vi.fn<typeof fetch>().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", fn);

    const res = await serverApi("/api/users/me");

    expect(res.status).toBe(503);
    expect(res.ok).toBe(false);
  });
});
