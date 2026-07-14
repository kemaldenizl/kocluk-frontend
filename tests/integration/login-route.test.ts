import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test for the login BFF path:
 *   route handler → serverApi (backend fetch) → session cookie persistence → response.
 *
 * `next/headers` cookies() is backed by an in-memory store; the backend fetch is
 * stubbed. Verifies the tokens are stored as cookies and stripped from the body.
 */

const cookieStore = new Map<string, { value: string }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => cookieStore.set(name, { value }),
  }),
}));

beforeEach(() => {
  cookieStore.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/auth/login (integration)", () => {
  it("persists tokens as cookies and returns the user without tokens", async () => {
    const backendPayload = {
      user: { id: "u1", email: "user@example.com", emailVerified: true, isActive: true },
      tokens: {
        accessToken: "access.jwt",
        accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
        refreshToken: "refresh.token",
        refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      },
      mfaChallenge: null,
      requiresMfa: false,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(backendPayload), { status: 200 })),
    );

    const { POST } = await import("@/app/api/auth/login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "P@ssw0rd12345" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    // Tokens are never exposed to the browser.
    expect(body.tokens).toBeUndefined();
    expect(body.user.email).toBe("user@example.com");
    expect(body.requiresMfa).toBe(false);
    // Tokens live in httpOnly cookies instead.
    expect(cookieStore.get("access_token")?.value).toBe("access.jwt");
    expect(cookieStore.get("refresh_token")?.value).toBe("refresh.token");
  });

  it("forwards backend validation errors without setting cookies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ title: "Unauthorized", status: 401 }), { status: 401 }),
      ),
    );

    const { POST } = await import("@/app/api/auth/login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "wrongpassword1" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(cookieStore.has("access_token")).toBe(false);
  });
});
