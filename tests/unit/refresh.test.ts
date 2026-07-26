import { afterEach, describe, expect, it, vi } from "vitest";
import { requestBackendRefresh } from "@/lib/auth/refresh";

/**
 * Unit tests for `requestBackendRefresh` — the single network call that rotates the
 * token pair. It must return the new tokens on success and null on any failure,
 * without persisting anything (that is the caller's job).
 */

function mockFetch(response: Response | Error) {
  const fn =
    response instanceof Error
      ? vi.fn<typeof fetch>().mockRejectedValue(response)
      : vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const newTokens = {
  accessToken: "new.access",
  accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
  refreshToken: "new.refresh",
  refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
};

describe("requestBackendRefresh", () => {
  it("POSTs the refresh token to the backend refresh endpoint", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ tokens: newTokens }), { status: 200 }));

    const result = await requestBackendRefresh("old.refresh");

    expect(result).toEqual(newTokens);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/auth/refresh");
    expect(init!.method).toBe("POST");
    expect(init!.body).toBe(JSON.stringify({ refreshToken: "old.refresh" }));
  });

  it("returns null when the backend responds non-2xx", async () => {
    mockFetch(new Response(JSON.stringify({ title: "Unauthorized" }), { status: 401 }));
    expect(await requestBackendRefresh("old.refresh")).toBeNull();
  });

  it("returns null when the 2xx response has no tokens field", async () => {
    mockFetch(new Response(JSON.stringify({ tokens: null }), { status: 200 }));
    expect(await requestBackendRefresh("old.refresh")).toBeNull();
  });

  it("returns null on a network failure (mapped to a 503 by serverApi)", async () => {
    mockFetch(new Error("ECONNREFUSED"));
    expect(await requestBackendRefresh("old.refresh")).toBeNull();
  });
});
