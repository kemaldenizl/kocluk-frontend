import { z } from "zod";

/**
 * Validation schemas for the MFA flows, shared by client forms (react-hook-form) and
 * route handlers (request-body validation) — one source of truth per contract.
 *
 * Two shapes appear here:
 *  - **Form** schemas (`*Form`) model the single field a user types on a screen.
 *  - **Request** schemas model the exact body a BFF route forwards to the backend,
 *    where a TOTP code and a recovery code are mutually-exclusive alternatives.
 */

const challengeToken = z.string().min(1, "Doğrulama oturumu bulunamadı.");

/** A 6-digit TOTP code from an authenticator app. Spaces are tolerated then stripped. */
const totpCode = z
  .string()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, "6 haneli doğrulama kodunu gir."));

/** A one-time recovery code (e.g. `ab12-cd34`). Trimmed; format is validated server-side. */
const recoveryCode = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().min(1, "Kurtarma kodunu gir."));

/* --- Setup ------------------------------------------------------------------ */

/** `POST /api/mfa/setup/complete` — confirm setup with a code from the app. */
export const mfaSetupCompleteSchema = z.object({ code: totpCode });
export type MfaSetupCompleteInput = z.infer<typeof mfaSetupCompleteSchema>;

/* --- Verification forms ----------------------------------------------------- */

/** Form: the user enters a TOTP code (used by login-challenge and disable screens). */
export const totpCodeFormSchema = z.object({ code: totpCode });
export type TotpCodeFormInput = z.infer<typeof totpCodeFormSchema>;

/** Form: the user enters a recovery code instead of a TOTP code. */
export const recoveryCodeFormSchema = z.object({ code: recoveryCode });
export type RecoveryCodeFormInput = z.infer<typeof recoveryCodeFormSchema>;

/* --- Request bodies (TOTP or recovery) -------------------------------------- */

/**
 * A body carrying exactly one of `totpCode` / `recoveryCode`. Both routes that accept
 * either credential (login-complete, disable) share this refinement.
 */
const oneVerificationCredential = {
  totpCode: totpCode.nullish(),
  recoveryCode: recoveryCode.nullish(),
} as const;

const exactlyOneCredential = (data: { totpCode?: string | null; recoveryCode?: string | null }) =>
  Boolean(data.totpCode) !== Boolean(data.recoveryCode);

const credentialError = { message: "Doğrulama kodu ya da kurtarma kodundan yalnızca birini gir." };

/** `POST /api/mfa/login/complete` — finish an MFA login with the emailed challenge. */
export const mfaLoginCompleteSchema = z
  .object({ challengeToken, ...oneVerificationCredential })
  .refine(exactlyOneCredential, credentialError);
export type MfaLoginCompleteInput = z.infer<typeof mfaLoginCompleteSchema>;

/** `POST /api/mfa/disable` — turn MFA off with a TOTP or recovery code. */
export const mfaDisableSchema = z
  .object({ ...oneVerificationCredential })
  .refine(exactlyOneCredential, credentialError);
export type MfaDisableInput = z.infer<typeof mfaDisableSchema>;

/** `POST /api/mfa/recovery-codes/regenerate` — replace recovery codes after a TOTP check. */
export const mfaRegenerateRecoveryCodesSchema = z.object({ totpCode });
export type MfaRegenerateRecoveryCodesInput = z.infer<typeof mfaRegenerateRecoveryCodesSchema>;
