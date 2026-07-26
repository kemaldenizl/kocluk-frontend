import "server-only";

import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/config/constants";
import { buildAuthCookies, buildClearAuthCookies, type TokenPair } from "./tokens";
import { clearMfaState } from "./mfa-state";

/**
 * Server-side session store backed by httpOnly cookies. Used inside route handlers
 * and server components (both of which can read via `cookies()`; only route handlers
 * and server actions may write).
 */

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.accessToken)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.refreshToken)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAccessToken());
}

/**
 * Reads the `email` claim from the access token for display only (unverified decode
 * — authorization is always enforced by the backend). Returns undefined if absent.
 */
export async function getSessionEmail(): Promise<string | undefined> {
  const token = await getAccessToken();
  const payload = token?.split(".")[1];
  if (!payload) return undefined;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return typeof json.email === "string" ? json.email : undefined;
  } catch {
    return undefined;
  }
}

/** Persists a freshly issued token pair. */
export async function persistSession(tokens: TokenPair): Promise<void> {
  const store = await cookies();
  for (const { name, value, options } of buildAuthCookies(tokens)) {
    store.set(name, value, options);
  }
}

/** Clears the session cookies plus the MFA hint (logout / invalid refresh). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const { name, value, options } of buildClearAuthCookies()) {
    store.set(name, value, options);
  }
  await clearMfaState();
}
