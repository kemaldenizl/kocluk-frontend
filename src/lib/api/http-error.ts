import type { ProblemDetails } from "./types";

/**
 * Error thrown by the client-side {@link routeApi} when a route handler responds
 * with a non-2xx status. Carries the parsed problem+json so UI can show a message
 * and, for validation errors, map issues back onto form fields.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail || problem.title || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }

  /** Field-level validation errors, if the backend returned any. */
  get fieldErrors(): Record<string, string[]> {
    return this.problem.errors ?? {};
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/** Type guard for use in `catch` blocks and react-query `onError`. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
