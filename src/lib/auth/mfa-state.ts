import "server-only";

import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/config/constants";

/**
 * Server-side hint recording whether the current session's account has MFA enabled.
 *
 * The backend exposes no "is MFA on?" endpoint and `/api/users/me` carries no such
 * flag, so the BFF maintains this httpOnly cookie and refreshes it at every point a
 * session is (re)created or MFA state changes:
 *  - login without MFA  → false      - MFA login completed → true
 *  - MFA setup completed → true       - MFA disabled        → false
 *
 * Because it is rewritten on every login, it self-heals if it ever drifts (e.g. MFA
 * toggled from another device). It is a display hint only — the backend remains the
 * authority and rejects invalid enable/disable attempts regardless of this value.
 */

const isProd = process.env.NODE_ENV === "production";

/** Generous lifetime; the value is authoritative only until the next login rewrites it. */
const MFA_STATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setMfaEnabled(enabled: boolean): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAMES.mfaEnabled, enabled ? "1" : "0", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MFA_STATE_MAX_AGE,
  });
}

export async function readMfaEnabled(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.mfaEnabled)?.value === "1";
}

/** Clears the hint (used on logout so a stale value never outlives its session). */
export async function clearMfaState(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAMES.mfaEnabled, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
