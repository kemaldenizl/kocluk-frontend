/**
 * MFA (TOTP + recovery codes) response shapes. See frontend_guide.md §5.
 * The login-completion response reuses {@link ClientLoginResult} from the auth
 * feature — its BFF route strips tokens into httpOnly cookies exactly like login.
 */

/** Result of `POST /api/mfa/setup/begin` — the data needed to render the QR + manual key. */
export interface MfaSetupBeginResult {
  /** Base32 secret shown as a copy/paste fallback when the QR cannot be scanned. */
  manualEntryKey: string;
  /** `otpauth://totp/...` URI to render as a QR code for authenticator apps. */
  otpAuthUri: string;
}

/** Result of setup-complete / recovery-codes-regenerate — one-time recovery codes. */
export interface RecoveryCodesResult {
  recoveryCodes: string[];
}

/** BFF-tracked hint of whether the current account has MFA enabled (see mfa-state.ts). */
export interface MfaStatus {
  enabled: boolean;
}
