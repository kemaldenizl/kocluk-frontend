import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for the BFF-tracked MFA-enabled hint cookie. `next/headers` cookies() is
 * an in-memory store so we can assert the written value/options and the read-back.
 */

const store = new Map<string, { value: string }>();
const setSpy = vi.fn((name: string, value: string, _options?: Record<string, unknown>) =>
  store.set(name, { value }),
);

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

describe("mfa-state", () => {
  it("writes '1' with an httpOnly, lax cookie when enabling", async () => {
    const { setMfaEnabled } = await import("@/lib/auth/mfa-state");
    await setMfaEnabled(true);

    expect(store.get("mfa_enabled")?.value).toBe("1");
    const opts = setSpy.mock.calls.at(-1)![2]!;
    expect(opts).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(opts.maxAge).toBeGreaterThan(0);
  });

  it("writes '0' when disabling", async () => {
    const { setMfaEnabled } = await import("@/lib/auth/mfa-state");
    await setMfaEnabled(false);
    expect(store.get("mfa_enabled")?.value).toBe("0");
  });

  it("reads true only for the exact '1' value", async () => {
    const { readMfaEnabled } = await import("@/lib/auth/mfa-state");

    expect(await readMfaEnabled()).toBe(false); // absent
    store.set("mfa_enabled", { value: "0" });
    expect(await readMfaEnabled()).toBe(false);
    store.set("mfa_enabled", { value: "1" });
    expect(await readMfaEnabled()).toBe(true);
  });

  it("clears the hint with an expired empty cookie", async () => {
    const { clearMfaState } = await import("@/lib/auth/mfa-state");
    await clearMfaState();
    expect(store.get("mfa_enabled")?.value).toBe("");
    expect(setSpy.mock.calls.at(-1)![2]).toMatchObject({ maxAge: 0 });
  });
});
