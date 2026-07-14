"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib/api/error-message";
import { ROUTES } from "@/config/constants";
import { useVerifyEmail } from "../hooks";

/**
 * Reached from the verification link. The token is read from the URL and submitted
 * automatically — the user never types it.
 */
export function VerifyEmailForm({ initialToken = "" }: { initialToken?: string }) {
  const verify = useVerifyEmail();

  const started = useRef(false);
  useEffect(() => {
    if (initialToken && !started.current) {
      started.current = true;
      verify.mutate({ token: initialToken });
    }
  }, [initialToken, verify]);

  if (!initialToken) {
    return <InvalidLink message="Bağlantı geçersiz. Yeni bir doğrulama bağlantısı iste." />;
  }

  if (verify.isSuccess) {
    return (
      <Alert variant="success" title="E-posta doğrulandı">
        E-postan onaylandı — artık giriş yapabilirsin.{" "}
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Giriş yap
        </Link>
        .
      </Alert>
    );
  }

  if (verify.isError) {
    return <InvalidLink message={getErrorMessage(verify.error)} />;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner /> E-postan doğrulanıyor…
    </div>
  );
}

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="Doğrulama başarısız">
        {message}
      </Alert>
      <Button variant="outline" className="w-full" asChild>
        <Link href={ROUTES.resendVerification}>Doğrulama bağlantısını tekrar gönder</Link>
      </Button>
    </div>
  );
}
