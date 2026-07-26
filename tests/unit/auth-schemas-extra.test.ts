import { describe, expect, it } from "vitest";
import {
  changeEmailConfirmSchema,
  changeEmailRequestSchema,
  changePasswordConfirmSchema,
  changePasswordRequestSchema,
  forgotPasswordSchema,
  newEmailSchema,
  newPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "@/features/auth/schemas";

/**
 * Covers the auth schemas not exercised by auth-schemas.test.ts: the token-based
 * confirm flows and the current-password request flows. These back both the forms
 * and their route handlers, so their pass/fail branches are the real contract.
 */

describe("forgotPassword / resendVerification / verifyEmail", () => {
  it("forgotPassword requires a non-empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("resendVerification requires a non-empty email", () => {
    expect(resendVerificationSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(resendVerificationSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("verifyEmail requires a token", () => {
    expect(verifyEmailSchema.safeParse({ token: "abc" }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
  });
});

describe("change-password request/confirm", () => {
  it("request requires the current password", () => {
    expect(changePasswordRequestSchema.safeParse({ currentPassword: "secret" }).success).toBe(true);
    expect(changePasswordRequestSchema.safeParse({ currentPassword: "" }).success).toBe(false);
  });

  it("confirm requires token, a 12+ char new password and a matching confirmation", () => {
    const base = { token: "t", newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" };
    expect(changePasswordConfirmSchema.safeParse(base).success).toBe(true);
    expect(changePasswordConfirmSchema.safeParse({ ...base, token: "" }).success).toBe(false);
    expect(changePasswordConfirmSchema.safeParse({ ...base, newPassword: "short", confirmNewPassword: "short" }).success).toBe(false);
    expect(changePasswordConfirmSchema.safeParse({ ...base, confirmNewPassword: "different1234" }).success).toBe(false);
  });
});

describe("change-email request/confirm", () => {
  it("request requires the current password", () => {
    expect(changeEmailRequestSchema.safeParse({ currentPassword: "secret" }).success).toBe(true);
    expect(changeEmailRequestSchema.safeParse({ currentPassword: "" }).success).toBe(false);
  });

  it("confirm requires a token and a non-empty new email", () => {
    expect(changeEmailConfirmSchema.safeParse({ token: "t", newEmail: "new@b.com" }).success).toBe(true);
    expect(changeEmailConfirmSchema.safeParse({ token: "", newEmail: "new@b.com" }).success).toBe(false);
    expect(changeEmailConfirmSchema.safeParse({ token: "t", newEmail: "" }).success).toBe(false);
  });
});

describe("confirm-page form schemas (token merged in later)", () => {
  it("newPasswordSchema validates length and match without a token field", () => {
    expect(newPasswordSchema.safeParse({ newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ newPassword: "P@ssw0rd12345", confirmNewPassword: "nope" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ newPassword: "short", confirmNewPassword: "short" }).success).toBe(false);
  });

  it("newEmailSchema requires a non-empty new email", () => {
    expect(newEmailSchema.safeParse({ newEmail: "new@b.com" }).success).toBe(true);
    expect(newEmailSchema.safeParse({ newEmail: "" }).success).toBe(false);
  });
});
