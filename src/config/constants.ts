/**
 * Shared, framework-agnostic constants. Safe to import from both client and server.
 */

/** Names of the httpOnly cookies used to persist the session. */
export const COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  /**
   * UI hint recording whether the current session's account has MFA enabled. The
   * backend exposes no MFA-status endpoint, so the BFF tracks it here and keeps it
   * in sync at every session-creation point (see `src/lib/auth/mfa-state.ts`).
   */
  mfaEnabled: "mfa_enabled",
} as const;

/** Application route paths, centralised to avoid magic strings. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  /** Post-login gate shown when the account's email is not yet verified. */
  verifyEmailNotice: "/verify-email-required",
  resendVerification: "/resend-verification",
  profile: "/profile",
  /** Two-step verification (MFA) management, reached from the profile page. */
  mfa: "/profile/mfa",
  /** Post-login step shown when an MFA-enabled account must complete a TOTP challenge. */
  mfaChallenge: "/mfa-challenge",
  admin: "/admin",
  /** Token-based confirmation pages reached from an email link (?token=...). */
  changeEmail: "/change-email",
  changePassword: "/change-password",
} as const;

/** Pages that require an authenticated session. */
export const PROTECTED_ROUTES: readonly string[] = [ROUTES.profile, ROUTES.admin];

/** Auth pages that an already-authenticated user should be redirected away from. */
export const AUTH_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register];

/** Query-string key used to remember where the user was heading before login. */
export const REDIRECT_PARAM = "from";

/**
 * sessionStorage key holding the email of an account awaiting verification, handed
 * from the login/register step to the verification notice. Kept out of the URL so the
 * address (personal data) never lands in query strings or history.
 */
export const PENDING_VERIFICATION_EMAIL_KEY = "kocluk.pendingVerificationEmail";

/**
 * sessionStorage key holding the pending MFA login challenge, handed from the login
 * step to the MFA challenge page. Kept out of the URL so the opaque challenge token
 * never lands in query strings, history, or referrer headers.
 */
export const MFA_CHALLENGE_KEY = "kocluk.mfaChallenge";
