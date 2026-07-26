"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import { getPendingVerificationEmail } from "../pending-verification";
import { ResendVerificationButton } from "./resend-verification-button";

// The pending email lives in sessionStorage (client-only) and never changes while this
// page is mounted, so `subscribe` is a no-op and the server snapshot is always null.
const subscribe = () => () => {};
const getServerSnapshot = (): string | null => null;

/**
 * Shown after a login attempt on an unverified account (the BFF withholds the session).
 * Explains that verification is required and lets the user re-send the link. The email
 * is read from sessionStorage (set at the login step) rather than the URL; when it is
 * absent — e.g. the page was opened directly — we fall back to the manual resend form.
 */
export function VerifyEmailNotice() {
  // useSyncExternalStore reads sessionStorage without an SSR hydration mismatch and
  // resolves to the real value before paint (no flash of the fallback branch).
  const email = useSyncExternalStore(subscribe, getPendingVerificationEmail, getServerSnapshot);

  return (
    <div className="flex flex-col gap-5">
      <Alert variant="info" title="E-posta doğrulaması gerekli">
        {email ? (
          <>
            Giriş yapabilmen için önce e-posta adresini doğrulaman gerekiyor.{" "}
            <strong className="text-foreground">{email}</strong> adresine gönderdiğimiz bağlantıdaki adımları
            tamamla.
          </>
        ) : (
          "Giriş yapabilmen için önce e-posta adresini doğrulaman gerekiyor. Sana gönderdiğimiz doğrulama bağlantısındaki adımları tamamla."
        )}
      </Alert>

      {email ? (
        <ResendVerificationButton email={email} />
      ) : (
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.resendVerification}>Doğrulama bağlantısını tekrar gönder</Link>
        </Button>
      )}
    </div>
  );
}
