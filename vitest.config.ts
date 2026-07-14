import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests live in the top-level `tests/` directory (unit + integration) and run in a
 * Node environment against the framework-agnostic lib/feature/route logic.
 * `server-only` is aliased to an empty stub so server modules import cleanly outside
 * the Next.js bundler.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      BACKEND_API_URL: "http://backend.test",
      DEFAULT_TENANT_ID: "00000000-0000-0000-0000-000000000001",
    },
  },
});
