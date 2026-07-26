import { MFA_CHALLENGE_KEY } from "@/config/constants";
import type { MfaChallenge } from "@/features/auth/types";

/**
 * Ephemeral handoff of a pending MFA login challenge between the login step and the
 * MFA challenge page. Backed by sessionStorage so it survives the client navigation
 * without ever entering the URL (the opaque challenge token must not leak into query
 * strings, history, or referrer headers). All access is SSR-safe — a missing
 * `window`/`sessionStorage` degrades to a no-op.
 */

/** The challenge plus where to send the user once verification succeeds. */
export interface PendingMfaChallenge extends MfaChallenge {
  /** Path the user was heading to before login (the `?from=` redirect target). */
  redirectTo: string;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    // Storage can throw in privacy modes / sandboxed contexts.
    return null;
  }
}

export function setPendingMfaChallenge(challenge: PendingMfaChallenge): void {
  storage()?.setItem(MFA_CHALLENGE_KEY, JSON.stringify(challenge));
}

/**
 * Raw JSON string (or null) as stored. Exposed as a primitive so it can back a
 * `useSyncExternalStore` snapshot without tripping React's "snapshot must be cached"
 * guard — the string is referentially stable between reads, an object would not be.
 */
export function peekPendingMfaChallengeRaw(): string | null {
  return storage()?.getItem(MFA_CHALLENGE_KEY) ?? null;
}

/** Parses a raw challenge string, returning null when absent or malformed. */
export function parsePendingMfaChallenge(raw: string | null): PendingMfaChallenge | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingMfaChallenge;
    return parsed.challengeToken ? parsed : null;
  } catch {
    return null;
  }
}

export function getPendingMfaChallenge(): PendingMfaChallenge | null {
  return parsePendingMfaChallenge(peekPendingMfaChallengeRaw());
}

export function clearPendingMfaChallenge(): void {
  storage()?.removeItem(MFA_CHALLENGE_KEY);
}
