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
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/{layout,page,loading,error,not-found}.tsx"],
    },
  },
});
