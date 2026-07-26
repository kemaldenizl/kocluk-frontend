import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the MFA BFF routes:
 *   route handler → serverApi/callBackendWithAuth (backend fetch) → cookie side
 *   effects → response.
 *
 * `next/headers` cookies() is an in-memory store and the backend fetch is stubbed, so
 * we verify token/hint cookie writes and body forwarding end-to-end.
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

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  cookieStore.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/mfa/status", () => {
  it("401s when there is no session", async () => {
    const { GET } = await import("@/app/api/mfa/status/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("reports enabled=true only when the hint cookie is '1'", async () => {
    cookieStore.set("access_token", { value: "acc" });
    cookieStore.set("mfa_enabled", { value: "1" });
    const { GET } = await import("@/app/api/mfa/status/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enabled: true });
  });

  it("reports enabled=false when the hint is absent", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const { GET } = await import("@/app/api/mfa/status/route");
    expect(await (await GET()).json()).toEqual({ enabled: false });
  });
});

describe("POST /api/mfa/setup/begin", () => {
  it("forwards the backend QR payload for the authenticated user", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const payload = { manualEntryKey: "JBSWY3DPEHPK3PXP", otpAuthUri: "otpauth://totp/Kocluk:u?secret=x" };
    const fetchMock = stubFetch(new Response(JSON.stringify(payload), { status: 200 }));
    const { POST } = await import("@/app/api/mfa/setup/begin/route");

    const res = await POST();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/mfa/setup/begin");
  });
});

describe("POST /api/mfa/setup/complete", () => {
  it("sets the MFA hint on success and returns recovery codes", async () => {
    cookieStore.set("access_token", { value: "acc" });
    stubFetch(new Response(JSON.stringify({ recoveryCodes: ["ab12-cd34"] }), { status: 200 }));
    const { POST } = await import("@/app/api/mfa/setup/complete/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/setup/complete", { code: "123456" }));

    expect(res.status).toBe(200);
    expect((await res.json()).recoveryCodes).toEqual(["ab12-cd34"]);
    expect(cookieStore.get("mfa_enabled")?.value).toBe("1");
  });

  it("400s an invalid code without calling the backend or touching the hint", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const fetchMock = stubFetch(new Response(null, { status: 200 }));
    const { POST } = await import("@/app/api/mfa/setup/complete/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/setup/complete", { code: "abc" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookieStore.has("mfa_enabled")).toBe(false);
  });

  it("does not set the hint when the backend rejects the code", async () => {
    cookieStore.set("access_token", { value: "acc" });
    stubFetch(new Response(JSON.stringify({ title: "Invalid code", status: 400 }), { status: 400 }));
    const { POST } = await import("@/app/api/mfa/setup/complete/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/setup/complete", { code: "123456" }));

    expect(res.status).toBe(400);
    expect(cookieStore.has("mfa_enabled")).toBe(false);
  });
});

describe("POST /api/mfa/login/complete", () => {
  const tokens = {
    accessToken: "access.jwt",
    accessTokenExpiresAtUtc: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken: "refresh.token",
    refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
  };

  it("persists the session + MFA hint and strips tokens from the body", async () => {
    const backendPayload = {
      user: { id: "u1", email: "user@example.com", emailVerified: true, isActive: true },
      tokens,
      mfaChallenge: null,
      requiresMfa: false,
    };
    stubFetch(new Response(JSON.stringify(backendPayload), { status: 200 }));
    const { POST } = await import("@/app/api/mfa/login/complete/route");

    const res = await POST(
      jsonRequest("http://localhost/api/mfa/login/complete", { challengeToken: "opaque", totpCode: "123456" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.tokens).toBeUndefined();
    expect(body.user.email).toBe("user@example.com");
    expect(cookieStore.get("access_token")?.value).toBe("access.jwt");
    expect(cookieStore.get("refresh_token")?.value).toBe("refresh.token");
    expect(cookieStore.get("mfa_enabled")?.value).toBe("1");
  });

  it("withholds the session for an unverified account and flags verification", async () => {
    const backendPayload = {
      user: { id: "u1", email: "unverified@example.com", emailVerified: false, isActive: true },
      tokens,
      mfaChallenge: null,
      requiresMfa: false,
    };
    stubFetch(new Response(JSON.stringify(backendPayload), { status: 200 }));
    const { POST } = await import("@/app/api/mfa/login/complete/route");

    const res = await POST(
      jsonRequest("http://localhost/api/mfa/login/complete", { challengeToken: "opaque", totpCode: "123456" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.requiresEmailVerification).toBe(true);
    expect(cookieStore.has("access_token")).toBe(false);
    expect(cookieStore.has("mfa_enabled")).toBe(false);
  });

  it("400s when neither a TOTP nor a recovery code is supplied", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 200 }));
    const { POST } = await import("@/app/api/mfa/login/complete/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/login/complete", { challengeToken: "opaque" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("relays invalid-challenge errors without setting cookies", async () => {
    stubFetch(new Response(JSON.stringify({ title: "Unauthorized", status: 401 }), { status: 401 }));
    const { POST } = await import("@/app/api/mfa/login/complete/route");

    const res = await POST(
      jsonRequest("http://localhost/api/mfa/login/complete", { challengeToken: "opaque", totpCode: "123456" }),
    );

    expect(res.status).toBe(401);
    expect(cookieStore.has("access_token")).toBe(false);
  });
});

describe("POST /api/mfa/disable", () => {
  it("clears the MFA hint on success and returns 204", async () => {
    cookieStore.set("access_token", { value: "acc" });
    cookieStore.set("mfa_enabled", { value: "1" });
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/mfa/disable/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/disable", { totpCode: "123456" }));

    expect(res.status).toBe(204);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/mfa/disable");
    expect(cookieStore.get("mfa_enabled")?.value).toBe("0");
  });

  it("400s when both credentials are supplied", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const { POST } = await import("@/app/api/mfa/disable/route");

    const res = await POST(
      jsonRequest("http://localhost/api/mfa/disable", { totpCode: "123456", recoveryCode: "ab12-cd34" }),
    );

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the hint when the backend rejects the code", async () => {
    cookieStore.set("access_token", { value: "acc" });
    cookieStore.set("mfa_enabled", { value: "1" });
    stubFetch(new Response(JSON.stringify({ title: "Invalid", status: 401 }), { status: 401 }));
    const { POST } = await import("@/app/api/mfa/disable/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/disable", { totpCode: "123456" }));

    expect(res.status).toBe(401);
    expect(cookieStore.get("mfa_enabled")?.value).toBe("1");
  });
});

describe("POST /api/mfa/recovery-codes/regenerate", () => {
  it("forwards fresh recovery codes for a valid TOTP code", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const fetchMock = stubFetch(new Response(JSON.stringify({ recoveryCodes: ["ff11-ee22"] }), { status: 200 }));
    const { POST } = await import("@/app/api/mfa/recovery-codes/regenerate/route");

    const res = await POST(
      jsonRequest("http://localhost/api/mfa/recovery-codes/regenerate", { totpCode: "123456" }),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).recoveryCodes).toEqual(["ff11-ee22"]);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/mfa/recovery-codes/regenerate");
  });

  it("400s a malformed TOTP code", async () => {
    cookieStore.set("access_token", { value: "acc" });
    const fetchMock = stubFetch(new Response(null, { status: 200 }));
    const { POST } = await import("@/app/api/mfa/recovery-codes/regenerate/route");

    const res = await POST(jsonRequest("http://localhost/api/mfa/recovery-codes/regenerate", { totpCode: "12" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
