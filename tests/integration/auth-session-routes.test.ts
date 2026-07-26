import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the session-mutating auth routes: logout, logout-all and
 * refresh. `next/headers` cookies() is an in-memory store and the backend fetch is
 * stubbed, so we verify cookie clearing/rotation end-to-end.
 */

const cookieStore = new Map<string, { value: string }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => cookieStore.set(name, { value }),
  }),
}));

function stubFetch(...responses: Response[]) {
  const fn = vi.fn<typeof fetch>();
  if (responses.length === 1) fn.mockResolvedValue(responses[0]);
  else for (const r of responses) fn.mockResolvedValueOnce(r);
  vi.stubGlobal("fetch", fn);
  return fn;
}

const tokens = {
  accessToken: "new.access",
  accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
  refreshToken: "new.refresh",
  refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
};

beforeEach(() => {
  cookieStore.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/auth/logout", () => {
  it("revokes the backend session then clears cookies and returns 204", async () => {
    cookieStore.set("access_token", { value: "acc" });
    cookieStore.set("refresh_token", { value: "ref" });
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/logout/route");

    const res = await POST();

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/logout");
    // Cookies are cleared regardless.
    expect(cookieStore.get("access_token")?.value).toBe("");
    expect(cookieStore.get("refresh_token")?.value).toBe("");
  });

  it("clears cookies even when the backend revoke fails", async () => {
    cookieStore.set("access_token", { value: "acc" });
    stubFetch(new Response(JSON.stringify({ title: "Boom" }), { status: 500 }));
    const { POST } = await import("@/app/api/auth/logout/route");

    const res = await POST();

    expect(res.status).toBe(204);
    expect(cookieStore.get("access_token")?.value).toBe("");
  });
});

describe("POST /api/auth/logout-all", () => {
  it("revokes every session then clears cookies and returns 204", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/logout-all/route");

    const res = await POST();

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/auth/logout-all");
    expect(cookieStore.get("access_token")?.value).toBe("");
  });
});

describe("POST /api/auth/refresh", () => {
  it("401s when there is no refresh cookie", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/auth/refresh/route");

    const res = await POST();

    expect(res.status).toBe(401);
    expect((await res.json()).title).toBe("Yetkisiz");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rotates and persists new cookies on a successful backend refresh", async () => {
    cookieStore.set("refresh_token", { value: "old.ref" });
    const fetchMock = stubFetch(new Response(JSON.stringify({ tokens }), { status: 200 }));
    const { POST } = await import("@/app/api/auth/refresh/route");

    const res = await POST();

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][1]!.body).toBe(JSON.stringify({ refreshToken: "old.ref" }));
    expect(cookieStore.get("access_token")?.value).toBe("new.access");
    expect(cookieStore.get("refresh_token")?.value).toBe("new.refresh");
  });

  it("clears the session and 401s when the backend refresh fails", async () => {
    cookieStore.set("refresh_token", { value: "stale.ref" });
    stubFetch(new Response(JSON.stringify({ title: "Unauthorized" }), { status: 401 }));
    const { POST } = await import("@/app/api/auth/refresh/route");

    const res = await POST();

    expect(res.status).toBe(401);
    expect(cookieStore.get("refresh_token")?.value).toBe("");
  });
});
