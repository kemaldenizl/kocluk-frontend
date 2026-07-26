import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for the server-only env loader. It validates BACKEND_API_URL once at
 * module load, so we re-import a fresh module per case with a stubbed env var.
 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("env.backendApiUrl", () => {
  it("exposes the configured backend URL", async () => {
    vi.stubEnv("BACKEND_API_URL", "http://backend.test");
    vi.resetModules();
    const { env } = await import("@/config/env");
    expect(env.backendApiUrl).toBe("http://backend.test");
  });

  it("strips a single trailing slash so path concatenation stays clean", async () => {
    vi.stubEnv("BACKEND_API_URL", "https://api.example.com/");
    vi.resetModules();
    const { env } = await import("@/config/env");
    expect(env.backendApiUrl).toBe("https://api.example.com");
  });

  it("throws a descriptive error when the variable is missing", async () => {
    vi.stubEnv("BACKEND_API_URL", "");
    vi.resetModules();
    await expect(import("@/config/env")).rejects.toThrow(/Missing required environment variable: BACKEND_API_URL/);
  });

  it("throws when the variable is only whitespace", async () => {
    vi.stubEnv("BACKEND_API_URL", "   ");
    vi.resetModules();
    await expect(import("@/config/env")).rejects.toThrow(/BACKEND_API_URL/);
  });
});
