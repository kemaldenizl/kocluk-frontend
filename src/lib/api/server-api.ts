import "server-only";

import { env } from "@/config/env";
import type { BackendResponse, HttpMethod, ProblemDetails } from "./types";

export interface ServerApiOptions {
  method?: HttpMethod;
  /** JSON-serialisable request body. Omit for GET / bodyless calls. */
  body?: unknown;
  /** Bearer token for authenticated endpoints. */
  accessToken?: string;
  /** Extra headers (rarely needed — kept for extensibility). */
  headers?: Record<string, string>;
  /** Forwarded to fetch for cache control; backend calls are non-cached by default. */
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * The ONLY function that talks to the backend API Gateway.
 *
 * Server-only. Centralises base URL, bearer auth, JSON handling and
 * error normalisation so route handlers stay thin and every call is consistent
 * (DRY + single responsibility). It never throws on HTTP errors — the caller
 * inspects `ok`/`status` and forwards or reacts accordingly.
 */
export async function serverApi<T = unknown>(
  path: string,
  options: ServerApiOptions = {},
): Promise<BackendResponse<T>> {
  const { method = "GET", body, accessToken, headers = {}, cache = "no-store", signal } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const hasBody = body !== undefined && method !== "GET";
  if (hasBody) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${env.backendApiUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      cache,
      signal,
    });
  } catch (cause) {
    // Network / DNS / connection failure — surface as a 503 problem so callers
    // can forward a consistent shape instead of crashing.
    const problem: ProblemDetails = {
      title: "Service Unavailable",
      status: 503,
      detail: "The backend service could not be reached.",
    };
    return { ok: false, status: 503, data: problem as T };
  }

  const data = (await parseBody(response)) as T;
  return { ok: response.ok, status: response.status, data };
}

/** Parses a JSON (or problem+json) body, tolerating empty 204/no-content responses. */
async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // Non-JSON body (unexpected) — wrap so downstream code always sees an object.
    return { title: "Unexpected response", status: response.status, detail: text } satisfies ProblemDetails;
  }
}
