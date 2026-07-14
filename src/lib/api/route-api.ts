import { ApiError } from "./http-error";
import type { HttpMethod, ProblemDetails } from "./types";

export interface RouteApiOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * The ONLY function the browser uses to reach our Next.js route handlers.
 *
 * Same-origin calls with cookies included (httpOnly session cookies ride along),
 * JSON in/out, and non-2xx responses raised as a typed {@link ApiError} so
 * react-query and forms get a consistent error to react to. Route handlers proxy
 * onward to the backend via {@link serverApi}, so the browser never sees the
 * backend URL, tokens, or tenant header.
 */
export async function routeApi<T = unknown>(path: string, options: RouteApiOptions = {}): Promise<T> {
  const { method = "GET", body, query, headers = {}, signal } = options;

  const url = buildUrl(path, query);
  const hasBody = body !== undefined && method !== "GET";

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await safeJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, (payload as ProblemDetails) ?? {});
  }

  return payload as T;
}

function buildUrl(path: string, query?: RouteApiOptions["query"]): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { title: response.statusText, status: response.status, detail: text };
  }
}
