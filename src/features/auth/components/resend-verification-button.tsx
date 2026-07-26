"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/error-message";
import { useResendVerification } from "../hooks";

/** Seconds the button stays disabled after a send, easing the backend rate limit (3/60s). */
const COOLDOWN_SECONDS = 30;

/**
 * One-click "resend the verification email" for a known address — used wherever the
 * email is already in hand (register success, the post-login verification notice), so
 * the user never re-types it. For the standalone case where the email must be entered,
 * use {@link ResendVerificationForm} instead.
 */
export function ResendVerificationButton({
  email,
  label = "Doğrulama e-postasını tekrar gönder",
}: {
  email: string;
  label?: string;
}) {
  const resend = useResendVerification();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onClick = useCallback(async () => {
    try {
      await resend.mutateAsync({ email });
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      // Surfaced below via resend.isError; nothing else to do here.
    }
  }, [email, resend]);

  return (
    <div className="flex flex-col gap-3">
      {resend.isSuccess ? <Alert variant="success">{resend.data.message}</Alert> : null}
      {resend.isError ? <Alert variant="error">{getErrorMessage(resend.error)}</Alert> : null}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onClick}
        loading={resend.isPending}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Tekrar gönder (${cooldown} sn)` : label}
      </Button>
    </div>
  );
}
