import { describe, expect, it, vi } from "vitest";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/http-error";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";

describe("applyFieldErrors", () => {
  it("maps RFC 7807 validation errors onto form fields", () => {
    const setError = vi.fn() as unknown as UseFormSetError<FieldValues>;
    const error = new ApiError(400, {
      status: 400,
      errors: { Email: ["'Email' is not a valid email address."], password: ["Too short."] },
    });

    const applied = applyFieldErrors(error, setError);

    expect(applied).toBe(true);
    // camelCases the leading segment (Email -> email)
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "'Email' is not a valid email address." });
    expect(setError).toHaveBeenCalledWith("password", { type: "server", message: "Too short." });
  });

  it("returns false for non-ApiError values", () => {
    const setError = vi.fn() as unknown as UseFormSetError<FieldValues>;
    expect(applyFieldErrors(new Error("boom"), setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
