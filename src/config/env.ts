import "server-only";

/**
 * Server-side environment configuration.
 *
 * These values must never be bundled into client code — they are read exclusively
 * inside route handlers, the proxy, and other server-only modules. Validated once
 * at module load so a misconfiguration fails fast instead of at request time.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  backendApiUrl: required("BACKEND_API_URL", process.env.BACKEND_API_URL).replace(/\/$/, ""),
} as const;
