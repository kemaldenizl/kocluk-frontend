import { afterEach, describe, expect, it, vi } from "vitest";
import { routeApi } from "@/lib/api/route-api";
import { ApiError, isApiError } from "@/lib/api/http-error";

/**
 * Unit tests for the client-side `routeApi` — the single fetch primitive the browser
 * uses to reach our own Next.js route handlers. We stub `fetch` and assert on the
 * request it builds and how it maps every response shape.
 */

function mockFetch(response: Response) {
  const fn = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("routeApi request building", () => {
  it("defaults to a same-origin GET with credentials and JSON Accept, no body", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await routeApi("/api/users/me");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/users/me");
    expect(init!.method).toBe("GET");
    expect(init!.credentials).toBe("include");
    expect(init!.body).toBeUndefined();
    const headers = init!.headers as Record<string, string>;
    expect(headers.Accept).toBe("application/json");
    // GET never gets a Content-Type header.
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("serialises a JSON body and sets Content-Type for write methods", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    await routeApi("/api/roles", { method: "POST", body: { name: "Editor" } });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init!.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init!.body).toBe(JSON.stringify({ name: "Editor" }));
  });

  it("never sends a body on GET even when one is provided", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify([]), { status: 200 }));

    await routeApi("/api/roles", { method: "GET", body: { ignored: true } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init!.body).toBeUndefined();
    expect((init!.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
  });

  it("appends defined query params and drops undefined ones", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify([]), { status: 200 }));

    await routeApi("/api/roles", { query: { tenantId: "t1", page: 2, active: true, skip: undefined } });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/roles?tenantId=t1&page=2&active=true");
  });

  it("returns the path unchanged when the query object is empty", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify([]), { status: 200 }));

    await routeApi("/api/roles", { query: {} });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/roles");
  });

  it("merges custom headers and forwards the abort signal", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const controller = new AbortController();

    await routeApi("/api/users/me", { headers: { "X-Trace": "abc" }, signal: controller.signal });

    const [, init] = fetchMock.mock.calls[0];
    expect((init!.headers as Record<string, string>)["X-Trace"]).toBe("abc");
    expect(init!.signal).toBe(controller.signal);
  });
});

describe("routeApi response handling", () => {
  it("returns null for a 204 No Content", async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(routeApi("/api/auth/logout", { method: "POST" })).resolves.toBeNull();
  });

  it("parses and returns the JSON body on success", async () => {
    mockFetch(new Response(JSON.stringify({ id: "u1", email: "a@b.com" }), { status: 200 }));
    await expect(routeApi("/api/users/me")).resolves.toEqual({ id: "u1", email: "a@b.com" });
  });

  it("returns null when a 200 has an empty body", async () => {
    mockFetch(new Response("", { status: 200 }));
    await expect(routeApi("/api/anything")).resolves.toBeNull();
  });

  it("throws a typed ApiError carrying the problem body on non-2xx", async () => {
    mockFetch(new Response(JSON.stringify({ title: "Yetkisiz", status: 401, detail: "Giriş yap." }), { status: 401 }));

    const error = (await routeApi("/api/users/me").catch((e) => e)) as ApiError;

    expect(isApiError(error)).toBe(true);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.isUnauthorized).toBe(true);
    expect(error.message).toBe("Giriş yap.");
  });

  it("wraps a non-JSON error body into a synthetic problem with the status text", async () => {
    mockFetch(new Response("<html>500</html>", { status: 500, statusText: "Internal Server Error" }));

    const error = (await routeApi("/api/users/me").catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.problem.detail).toBe("<html>500</html>");
    expect(error.problem.title).toBe("Internal Server Error");
  });

  it("throws an ApiError with an empty problem when the error body is empty", async () => {
    mockFetch(new Response("", { status: 403 }));

    const error = (await routeApi("/api/admin").catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.fieldErrors).toEqual({});
  });
});
