import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for `callBackendWithAuth` — the auto-refresh wrapper every protected
 * route handler goes through. The session store and the refresh network call are
 * mocked so we can drive each branch of the "401 → refresh → retry" state machine.
 * `fetch` is stubbed for the underlying `serverApi` request.
 */

const session = {
  getAccessToken: vi.fn<() => Promise<string | undefined>>(),
  getRefreshToken: vi.fn<() => Promise<string | undefined>>(),
  persistSession: vi.fn<() => Promise<void>>(),
  clearSession: vi.fn<() => Promise<void>>(),
};
const requestBackendRefresh = vi.fn();

vi.mock("@/lib/auth/session", () => session);
vi.mock("@/lib/auth/refresh", () => ({ requestBackendRefresh }));

function fetchReturning(...responses: Response[]) {
  const fn = vi.fn<typeof fetch>();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  vi.stubGlobal("fetch", fn);
  return fn;
}

const rotated = {
  accessToken: "fresh.access",
  accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
  refreshToken: "fresh.refresh",
  refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  session.getAccessToken.mockResolvedValue("acc");
  session.getRefreshToken.mockResolvedValue("ref");
  session.persistSession.mockResolvedValue();
  session.clearSession.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("callBackendWithAuth — happy path", () => {
  it("attaches the current access token and returns the response without refreshing", async () => {
    const fetchMock = fetchReturning(new Response(JSON.stringify({ id: "u1" }), { status: 200 }));
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    const res = await callBackendWithAuth("/api/users/me");

    expect(res).toEqual({ ok: true, status: 200, data: { id: "u1" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const headers = fetchMock.mock.calls[0][1]!.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer acc");
    expect(requestBackendRefresh).not.toHaveBeenCalled();
  });

  it("does not attempt a refresh for non-401 errors like 403", async () => {
    fetchReturning(new Response(JSON.stringify({ title: "Forbidden" }), { status: 403 }));
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    const res = await callBackendWithAuth("/api/admin");

    expect(res.status).toBe(403);
    expect(requestBackendRefresh).not.toHaveBeenCalled();
  });
});

describe("callBackendWithAuth — 401 handling", () => {
  it("returns the 401 untouched when there is no refresh token", async () => {
    session.getRefreshToken.mockResolvedValue(undefined);
    fetchReturning(new Response(JSON.stringify({ title: "Unauthorized" }), { status: 401 }));
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    const res = await callBackendWithAuth("/api/users/me");

    expect(res.status).toBe(401);
    expect(requestBackendRefresh).not.toHaveBeenCalled();
    expect(session.clearSession).not.toHaveBeenCalled();
  });

  it("clears the session and returns the original 401 when the refresh fails", async () => {
    requestBackendRefresh.mockResolvedValue(null);
    fetchReturning(new Response(JSON.stringify({ title: "Unauthorized" }), { status: 401 }));
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    const res = await callBackendWithAuth("/api/users/me");

    expect(requestBackendRefresh).toHaveBeenCalledWith("ref");
    expect(session.clearSession).toHaveBeenCalledTimes(1);
    expect(session.persistSession).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });

  it("refreshes, persists the new pair and retries once with the fresh token", async () => {
    requestBackendRefresh.mockResolvedValue(rotated);
    const fetchMock = fetchReturning(
      new Response(JSON.stringify({ title: "Unauthorized" }), { status: 401 }),
      new Response(JSON.stringify({ id: "u1" }), { status: 200 }),
    );
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    const res = await callBackendWithAuth("/api/users/me");

    expect(session.persistSession).toHaveBeenCalledWith(rotated);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = fetchMock.mock.calls[1][1]!.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe("Bearer fresh.access");
    expect(res).toEqual({ ok: true, status: 200, data: { id: "u1" } });
    expect(session.clearSession).not.toHaveBeenCalled();
  });

  it("forwards the method and body through to both the first attempt and the retry", async () => {
    requestBackendRefresh.mockResolvedValue(rotated);
    const fetchMock = fetchReturning(
      new Response(null, { status: 401 }),
      new Response(null, { status: 204 }),
    );
    const { callBackendWithAuth } = await import("@/lib/auth/backend-auth");

    await callBackendWithAuth("/api/roles", { method: "POST", body: { name: "Editor" } });

    for (const call of fetchMock.mock.calls) {
      expect(call[1]!.method).toBe("POST");
      expect(call[1]!.body).toBe(JSON.stringify({ name: "Editor" }));
    }
  });
});
