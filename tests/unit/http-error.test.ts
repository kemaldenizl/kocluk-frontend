import { describe, expect, it } from "vitest";
import { ApiError, isApiError } from "@/lib/api/http-error";

/** Unit tests for the typed `ApiError` and its `isApiError` guard. */

describe("ApiError message resolution", () => {
  it("prefers the problem detail for the message", () => {
    const error = new ApiError(400, { detail: "Ayrıntı", title: "Başlık" });
    expect(error.message).toBe("Ayrıntı");
  });

  it("falls back to the title when there is no detail", () => {
    const error = new ApiError(404, { title: "Bulunamadı" });
    expect(error.message).toBe("Bulunamadı");
  });

  it("falls back to a status-based message when neither detail nor title exist", () => {
    const error = new ApiError(500, {});
    expect(error.message).toBe("Request failed with status 500");
  });

  it("carries the name, status and raw problem", () => {
    const problem = { status: 422, title: "Doğrulama" };
    const error = new ApiError(422, problem);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(422);
    expect(error.problem).toBe(problem);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("ApiError flags and field errors", () => {
  it("exposes the field errors map when present, else an empty object", () => {
    const withErrors = new ApiError(400, { errors: { email: ["gerekli"] } });
    expect(withErrors.fieldErrors).toEqual({ email: ["gerekli"] });
    expect(new ApiError(400, {}).fieldErrors).toEqual({});
  });

  it("flags 401 as unauthorized and 429 as rate limited, exclusively", () => {
    expect(new ApiError(401, {}).isUnauthorized).toBe(true);
    expect(new ApiError(401, {}).isRateLimited).toBe(false);
    expect(new ApiError(429, {}).isRateLimited).toBe(true);
    expect(new ApiError(429, {}).isUnauthorized).toBe(false);
    expect(new ApiError(500, {}).isUnauthorized).toBe(false);
    expect(new ApiError(500, {}).isRateLimited).toBe(false);
  });
});

describe("isApiError", () => {
  it("is true only for ApiError instances", () => {
    expect(isApiError(new ApiError(400, {}))).toBe(true);
    expect(isApiError(new Error("boom"))).toBe(false);
    expect(isApiError("string")).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError({ status: 400 })).toBe(false);
  });
});
