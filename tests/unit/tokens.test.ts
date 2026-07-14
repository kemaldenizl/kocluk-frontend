import { describe, expect, it } from "vitest";
import { COOKIE_NAMES } from "@/config/constants";
import { buildAuthCookies, buildClearAuthCookies, type TokenPair } from "@/lib/auth/tokens";

function makeTokens(overrides: Partial<TokenPair> = {}): TokenPair {
  return {
    accessToken: "access.jwt",
    accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken: "refresh.token",
    refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
    ...overrides,
  };
}

describe("buildAuthCookies", () => {
  it("emits httpOnly access + refresh cookies with lifetimes tied to token expiry", () => {
    const cookies = buildAuthCookies(makeTokens());

    const access = cookies.find((c) => c.name === COOKIE_NAMES.accessToken)!;
    const refresh = cookies.find((c) => c.name === COOKIE_NAMES.refreshToken)!;

    expect(access.options.httpOnly).toBe(true);
    expect(access.options.sameSite).toBe("lax");
    // access ~15 min, refresh ~7 days — refresh must outlive access
    expect(access.options.maxAge).toBeGreaterThan(0);
    expect(refresh.options.maxAge).toBeGreaterThan(access.options.maxAge);
  });

  it("floors past-dated expiries to a zero maxAge", () => {
    const cookies = buildAuthCookies(makeTokens({ accessTokenExpiresAtUtc: new Date(Date.now() - 1000).toISOString() }));
    const access = cookies.find((c) => c.name === COOKIE_NAMES.accessToken)!;
    expect(access.options.maxAge).toBe(0);
  });
});

describe("buildClearAuthCookies", () => {
  it("expires both cookies immediately", () => {
    const cookies = buildClearAuthCookies();
    expect(cookies).toHaveLength(2);
    expect(cookies.every((c) => c.options.maxAge === 0 && c.value === "")).toBe(true);
  });
});
