/**
 * Shared, framework-agnostic constants. Safe to import from both client and server.
 */

/** Names of the httpOnly cookies used to persist the session. */
export const COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
} as const;

/** Multi-tenancy header expected by the Security service. */
export const TENANT_HEADER = "X-Tenant-Id";

/** Application route paths, centralised to avoid magic strings. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  resendVerification: "/resend-verification",
  profile: "/profile",
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
