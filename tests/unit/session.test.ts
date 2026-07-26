import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for the cookie-backed server session store. `next/headers` cookies()
 * is replaced with an in-memory store so we can exercise reads, the unverified JWT
 * email decode, and the persist/clear cookie writes without a running server.
 */

const store = new Map<string, { value: string }>();
const setSpy = vi.fn<(name: string, value: string, options?: unknown) => void>((name, value) => {
  store.set(name, { value });
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => store.get(name),
    set: setSpy,
  }),
}));

beforeEach(() => {
  store.clear();
  setSpy.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Builds a fake, unsigned JWT whose payload is the given object (base64, no verification). */
function fakeJwt(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `header.${body}.signature`;
}

describe("token readers", () => {
  it("reads the access and refresh tokens from cookies", async () => {
    store.set("access_token", { value: "acc" });
    store.set("refresh_token", { value: "ref" });
    const { getAccessToken, getRefreshToken } = await import("@/lib/auth/session");
    expect(await getAccessToken()).toBe("acc");
    expect(await getRefreshToken()).toBe("ref");
  });

  it("returns undefined when the cookies are absent", async () => {
    const { getAccessToken, getRefreshToken } = await import("@/lib/auth/session");
    expect(await getAccessToken()).toBeUndefined();
    expect(await getRefreshToken()).toBeUndefined();
  });
});

describe("isAuthenticated", () => {
  it("is true only when an access token cookie exists", async () => {
    const { isAuthenticated } = await import("@/lib/auth/session");
    expect(await isAuthenticated()).toBe(false);
    store.set("access_token", { value: "acc" });
    expect(await isAuthenticated()).toBe(true);
  });
});

describe("getSessionEmail", () => {
  it("decodes the email claim from the access token payload", async () => {
    store.set("access_token", { value: fakeJwt({ email: "user@example.com", sub: "u1" }) });
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBe("user@example.com");
  });

  it("returns undefined when there is no token", async () => {
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBeUndefined();
  });

  it("returns undefined when the payload has no email claim", async () => {
    store.set("access_token", { value: fakeJwt({ sub: "u1" }) });
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBeUndefined();
  });

  it("returns undefined for a malformed token with no payload segment", async () => {
    store.set("access_token", { value: "not-a-jwt" });
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBeUndefined();
  });

  it("returns undefined when the payload is not valid base64 JSON", async () => {
    store.set("access_token", { value: "header.@@@notbase64json@@@.sig" });
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBeUndefined();
  });

  it("ignores a non-string email claim", async () => {
    store.set("access_token", { value: fakeJwt({ email: 12345 }) });
    const { getSessionEmail } = await import("@/lib/auth/session");
    expect(await getSessionEmail()).toBeUndefined();
  });
});

describe("persistSession / clearSession", () => {
  const tokens = {
    accessToken: "access.jwt",
    accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken: "refresh.token",
    refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
  };

  it("writes both auth cookies with the built options", async () => {
    const { persistSession } = await import("@/lib/auth/session");
    await persistSession(tokens);

    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(store.get("access_token")?.value).toBe("access.jwt");
    expect(store.get("refresh_token")?.value).toBe("refresh.token");
    const accessCall = setSpy.mock.calls.find((c) => c[0] === "access_token")!;
    expect(accessCall[2]).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("clears both cookies with an empty value", async () => {
    const { clearSession } = await import("@/lib/auth/session");
    await clearSession();
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(store.get("access_token")?.value).toBe("");
    expect(store.get("refresh_token")?.value).toBe("");
    const call = setSpy.mock.calls.find((c) => c[0] === "access_token")!;
    expect(call[2]).toMatchObject({ maxAge: 0 });
  });
});
