import { describe, expect, it } from "vitest";
import {
  mfaDisableSchema,
  mfaLoginCompleteSchema,
  mfaRegenerateRecoveryCodesSchema,
  mfaSetupCompleteSchema,
  recoveryCodeFormSchema,
  totpCodeFormSchema,
} from "@/features/mfa/schemas";

/**
 * The MFA schemas are the shared client+server validation contract. The key rules:
 * TOTP codes are exactly 6 digits (whitespace tolerated then stripped), recovery
 * codes are non-empty (trimmed), and the login/disable bodies accept EXACTLY ONE of
 * a TOTP or recovery credential.
 */

describe("totpCodeFormSchema", () => {
  it("accepts a 6-digit code and strips surrounding spaces", () => {
    const result = totpCodeFormSchema.safeParse({ code: " 123 456 " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.code).toBe("123456");
  });

  it("rejects non-6-digit or non-numeric codes", () => {
    for (const code of ["12345", "1234567", "12a456", ""]) {
      expect(totpCodeFormSchema.safeParse({ code }).success).toBe(false);
    }
  });
});

describe("recoveryCodeFormSchema", () => {
  it("accepts a trimmed non-empty code", () => {
    const result = recoveryCodeFormSchema.safeParse({ code: "  ab12-cd34 " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.code).toBe("ab12-cd34");
  });

  it("rejects an empty / whitespace-only code", () => {
    expect(recoveryCodeFormSchema.safeParse({ code: "   " }).success).toBe(false);
  });
});

describe("mfaSetupCompleteSchema", () => {
  it("requires a 6-digit code", () => {
    expect(mfaSetupCompleteSchema.safeParse({ code: "654321" }).success).toBe(true);
    expect(mfaSetupCompleteSchema.safeParse({ code: "abc" }).success).toBe(false);
  });
});

describe("mfaLoginCompleteSchema (exactly one credential)", () => {
  const challengeToken = "opaque-token";

  it("accepts a challenge with only a TOTP code", () => {
    expect(mfaLoginCompleteSchema.safeParse({ challengeToken, totpCode: "123456" }).success).toBe(true);
  });

  it("accepts a challenge with only a recovery code", () => {
    expect(mfaLoginCompleteSchema.safeParse({ challengeToken, recoveryCode: "ab12-cd34" }).success).toBe(true);
  });

  it("rejects supplying both credentials", () => {
    expect(
      mfaLoginCompleteSchema.safeParse({ challengeToken, totpCode: "123456", recoveryCode: "ab12-cd34" }).success,
    ).toBe(false);
  });

  it("rejects supplying neither credential", () => {
    expect(mfaLoginCompleteSchema.safeParse({ challengeToken }).success).toBe(false);
  });

  it("requires a challenge token", () => {
    expect(mfaLoginCompleteSchema.safeParse({ challengeToken: "", totpCode: "123456" }).success).toBe(false);
  });
});

describe("mfaDisableSchema (exactly one credential)", () => {
  it("accepts one credential and rejects both/neither", () => {
    expect(mfaDisableSchema.safeParse({ totpCode: "123456" }).success).toBe(true);
    expect(mfaDisableSchema.safeParse({ recoveryCode: "ab12-cd34" }).success).toBe(true);
    expect(mfaDisableSchema.safeParse({ totpCode: "123456", recoveryCode: "ab12-cd34" }).success).toBe(false);
    expect(mfaDisableSchema.safeParse({}).success).toBe(false);
  });
});

describe("mfaRegenerateRecoveryCodesSchema", () => {
  it("requires a valid TOTP code", () => {
    expect(mfaRegenerateRecoveryCodesSchema.safeParse({ totpCode: "123456" }).success).toBe(true);
    expect(mfaRegenerateRecoveryCodesSchema.safeParse({ totpCode: "12" }).success).toBe(false);
  });
});
