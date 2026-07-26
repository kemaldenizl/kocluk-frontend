import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Contract test for the client-side MFA API. Every call must go through `routeApi`
 * with the exact path, method and body the route handlers expect. `routeApi` is
 * mocked so these assert the request contract without any network.
 */

const routeApi = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/api/route-api", () => ({ routeApi }));

beforeEach(() => {
  routeApi.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function lastCall() {
  return routeApi.mock.calls.at(-1)!;
}

describe("mfaApi", () => {
  it("maps each method to the right route, verb and body", async () => {
    const { mfaApi } = await import("@/features/mfa/api");

    await mfaApi.status();
    expect(lastCall()).toEqual(["/api/mfa/status"]);

    await mfaApi.setupBegin();
    expect(lastCall()).toEqual(["/api/mfa/setup/begin", { method: "POST" }]);

    await mfaApi.setupComplete({ code: "123456" });
    expect(lastCall()).toEqual(["/api/mfa/setup/complete", { method: "POST", body: { code: "123456" } }]);

    await mfaApi.loginComplete({ challengeToken: "t", totpCode: "123456" });
    expect(lastCall()).toEqual([
      "/api/mfa/login/complete",
      { method: "POST", body: { challengeToken: "t", totpCode: "123456" } },
    ]);

    await mfaApi.disable({ recoveryCode: "ab12-cd34" });
    expect(lastCall()).toEqual(["/api/mfa/disable", { method: "POST", body: { recoveryCode: "ab12-cd34" } }]);

    await mfaApi.regenerateRecoveryCodes({ totpCode: "123456" });
    expect(lastCall()).toEqual([
      "/api/mfa/recovery-codes/regenerate",
      { method: "POST", body: { totpCode: "123456" } },
    ]);
  });
});
