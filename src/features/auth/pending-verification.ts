import { PENDING_VERIFICATION_EMAIL_KEY } from "@/config/constants";

/**
 * Ephemeral handoff of the "awaiting verification" email between the login/register
 * step and the verification notice page. Backed by sessionStorage so the address
 * survives a client navigation (and a refresh) without ever entering the URL. All
 * access is SSR-safe — a missing `window`/`sessionStorage` degrades to a no-op.
 */

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    // Storage can throw in privacy modes / sandboxed contexts.
    return null;
  }
}

export function setPendingVerificationEmail(email: string): void {
  storage()?.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
}

export function getPendingVerificationEmail(): string | null {
  return storage()?.getItem(PENDING_VERIFICATION_EMAIL_KEY) ?? null;
}

export function clearPendingVerificationEmail(): void {
  storage()?.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
}
