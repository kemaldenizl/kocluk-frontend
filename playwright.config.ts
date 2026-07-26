import { defineConfig, devices } from "@playwright/test";

/**
 * E2E configuration. The suite boots two servers (Playwright manages both):
 *   1. A zero-dependency mock backend (tests/e2e/support/mock-backend.mjs).
 *   2. The Next.js app under test, with BACKEND_API_URL pointed at that mock, so the
 *      full BFF chain (route handlers, cookies, proxy) runs for real.
 *
 * Ports are dedicated (3100 app / 8899 mock) to avoid clashing with a real dev
 * server on 3000 or backend on 8080.
 */

const APP_PORT = 3100;
const MOCK_PORT = 8899;
const BASE_URL = `http://localhost:${APP_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e/specs",
  testMatch: "**/*.spec.ts",
  // Keep unit/integration (vitest) out of Playwright's sight entirely.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: [
    {
      command: `node tests/e2e/support/mock-backend.mjs`,
      port: MOCK_PORT,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      env: { MOCK_BACKEND_PORT: String(MOCK_PORT) },
    },
    {
      command: `npx next dev -p ${APP_PORT}`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { BACKEND_API_URL: `http://localhost:${MOCK_PORT}` },
    },
  ],
});
