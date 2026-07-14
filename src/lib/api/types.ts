/**
 * RFC 7807 problem details returned by the backend for every error response.
 * Validation errors additionally carry a field-keyed `errors` map.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}

/** Normalised outcome of a backend call. Never throws — status is always surfaced. */
export interface BackendResponse<T = unknown> {
  ok: boolean;
  status: number;
  /** Parsed JSON payload (success body, or a {@link ProblemDetails} on error). Null for 204. */
  data: T;
}

/** HTTP methods used across the app. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
