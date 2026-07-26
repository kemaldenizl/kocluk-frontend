import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/api/error-message";
import { ApiError } from "@/lib/api/http-error";

/** Unit tests for `getErrorMessage` — the single place UI turns a thrown error into copy. */

describe("getErrorMessage", () => {
  it("returns a friendly Turkish note for rate-limited ApiErrors", () => {
    const message = getErrorMessage(new ApiError(429, { detail: "raw backend detail" }));
    expect(message).toBe("Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar dene.");
  });

  it("returns the ApiError message for non-rate-limit API errors", () => {
    expect(getErrorMessage(new ApiError(400, { detail: "Geçersiz e-posta." }))).toBe("Geçersiz e-posta.");
  });

  it("returns the message of a plain Error", () => {
    expect(getErrorMessage(new Error("network down"))).toBe("network down");
  });

  it("returns a generic fallback for non-Error throwables", () => {
    const fallback = "Bir şeyler ters gitti. Lütfen tekrar dene.";
    expect(getErrorMessage("string error")).toBe(fallback);
    expect(getErrorMessage(null)).toBe(fallback);
    expect(getErrorMessage(undefined)).toBe(fallback);
    expect(getErrorMessage({ message: "not a real error" })).toBe(fallback);
  });
});
