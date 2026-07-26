import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the edge proxy (Next 16's renamed middleware). It gates
 * protected pages, transparently rotates an expired access token from the refresh
 * cookie, and bounces signed-in users off auth pages. `requestBackendRefresh` is
 * mocked so we drive the rotation branch without a backend.
 */

const requestBackendRefresh = vi.fn();
vi.mock("@/lib/auth/refresh", () => ({ requestBackendRefresh }));

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(`http://localhost${path}`));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

const rotated = {
  accessToken: "fresh.access",
  accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
  refreshToken: "fresh.refresh",
  refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("public pages", () => {
  it("lets an anonymous user through a non-protected page", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(requestBackendRefresh).not.toHaveBeenCalled();
  });
});

describe("auth pages", () => {
  it("redirects an authenticated user away from /login to /profile", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/login", { access_token: "acc" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/profile");
  });

  it("lets an anonymous user reach /login", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/login"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});

describe("protected pages", () => {
  it("lets a request with a valid-looking access cookie through", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/profile", { access_token: "acc" }));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(requestBackendRefresh).not.toHaveBeenCalled();
  });

  it("rotates from the refresh cookie and sets fresh cookies when access is gone", async () => {
    requestBackendRefresh.mockResolvedValue(rotated);
    const { proxy } = await import("@/proxy");

    const res = await proxy(makeRequest("/profile", { refresh_token: "ref" }));

    expect(requestBackendRefresh).toHaveBeenCalledWith("ref");
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.cookies.get("access_token")?.value).toBe("fresh.access");
    expect(res.cookies.get("refresh_token")?.value).toBe("fresh.refresh");
  });

  it("redirects to /login with a ?from param when there is no session at all", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/admin"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("from")).toBe("/admin");
  });

  it("redirects to /login when the refresh attempt fails", async () => {
    requestBackendRefresh.mockResolvedValue(null);
    const { proxy } = await import("@/proxy");

    const res = await proxy(makeRequest("/profile", { refresh_token: "stale" }));

    expect(requestBackendRefresh).toHaveBeenCalledWith("stale");
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("guards nested protected paths too", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(makeRequest("/admin/users"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).searchParams.get("from")).toBe("/admin/users");
  });
});
