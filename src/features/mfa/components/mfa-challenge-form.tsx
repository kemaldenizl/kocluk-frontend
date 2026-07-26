"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error-message";
import { ROUTES } from "@/config/constants";
import { setPendingVerificationEmail } from "@/features/auth/pending-verification";
import { MfaCodeForm, type MfaCodeSubmit } from "./mfa-code-form";
import {
  clearPendingMfaChallenge,
  parsePendingMfaChallenge,
  peekPendingMfaChallengeRaw,
} from "../challenge-store";
import { useCompleteMfaLogin } from "../hooks";

// The challenge lives in sessionStorage (client-only) and does not change while this
// page is mounted, so `subscribe` is a no-op and the server snapshot is always null.
const subscribe = () => () => {};
const getServerSnapshot = (): string | null => null;

/**
 * Completes an MFA login. The pending challenge is read from sessionStorage (never the
 * URL); if it is missing or expired the user is sent back to sign in. On success the
 * BFF has set the session cookies, so we redirect to the originally requested page.
 */
export function MfaChallengeForm() {
  const router = useRouter();
  const complete = useCompleteMfaLogin();
  const [expiredError, setExpiredError] = useState(false);

  // useSyncExternalStore reads sessionStorage without an SSR hydration mismatch and
  // resolves to the real value before paint (no flash of the fallback branch).
  const raw = useSyncExternalStore(subscribe, peekPendingMfaChallengeRaw, getServerSnapshot);
  const challenge = useMemo(() => parsePendingMfaChallenge(raw), [raw]);

  if (!challenge || expiredError) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error" title="Doğrulama süresi doldu">
          Doğrulama oturumun bulunamadı ya da süresi doldu. Lütfen yeniden giriş yap.
        </Alert>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.login}>Girişe dön</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async ({ code, useRecovery }: MfaCodeSubmit) => {
    // Guard client-side (event handler, so time reads are fine); the backend also enforces it.
    if (new Date(challenge.expiresAtUtc).getTime() <= Date.now()) {
      setExpiredError(true);
      return;
    }

    const result = await complete.mutateAsync({
      challengeToken: challenge.challengeToken,
      ...(useRecovery ? { recoveryCode: code } : { totpCode: code }),
    });

    clearPendingMfaChallenge();

    if (result.requiresEmailVerification) {
      setPendingVerificationEmail(result.user.email);
      router.replace(ROUTES.verifyEmailNotice);
      return;
    }

    router.replace(challenge.redirectTo || ROUTES.profile);
    // Re-render server components (e.g. the auth-aware header) with the new session.
    router.refresh();
  };

  return (
    <MfaCodeForm
      onSubmit={onSubmit}
      submitLabel="Doğrula ve giriş yap"
      pending={complete.isPending}
      error={complete.isError ? getErrorMessage(complete.error) : null}
      allowRecovery
      autoFocus
    />
  );
}
