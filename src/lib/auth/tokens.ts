import { COOKIE_NAMES } from "@/config/constants";

/** Token pair as returned by the backend under `tokens`. */
export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}

/** A single cookie to set, framework-agnostic so both route handlers and the proxy can apply it. */
export interface CookieSpec {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    path: string;
    maxAge: number;
  };
}

const isProd = process.env.NODE_ENV === "production";

/** Seconds from now until `isoExpiry`, floored at 0. Used to align cookie lifetime with token lifetime. */
function maxAgeFrom(isoExpiry: string): number {
  const seconds = Math.floor((new Date(isoExpiry).getTime() - Date.now()) / 1000);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}

/**
 * Builds the access + refresh cookie specs for a token pair.
 *
 * Cookie `maxAge` mirrors each token's expiry: when the short-lived access cookie
 * naturally expires, the proxy sees it missing and transparently refreshes using
 * the still-valid refresh cookie. Both are httpOnly so JS can never read them.
 */
export function buildAuthCookies(tokens: TokenPair): CookieSpec[] {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  return [
    {
      name: COOKIE_NAMES.accessToken,
      value: tokens.accessToken,
      options: { ...base, maxAge: maxAgeFrom(tokens.accessTokenExpiresAtUtc) },
    },
    {
      name: COOKIE_NAMES.refreshToken,
      value: tokens.refreshToken,
      options: { ...base, maxAge: maxAgeFrom(tokens.refreshTokenExpiresAtUtc) },
    },
  ];
}

/** Cookie specs that clear the session (maxAge 0). */
export function buildClearAuthCookies(): CookieSpec[] {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  return [
    { name: COOKIE_NAMES.accessToken, value: "", options: base },
    { name: COOKIE_NAMES.refreshToken, value: "", options: base },
  ];
}
