import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { MfaChallengeForm } from "@/features/mfa/components/mfa-challenge-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "İki adımlı doğrulama" };

export default function MfaChallengePage() {
  return (
    <AuthShell
      title="İki adımlı doğrulama"
      description="Girişini tamamlamak için kimlik doğrulayıcı uygulamandaki kodu gir."
      footer={
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Girişe dön
        </Link>
      }
    >
      <MfaChallengeForm />
    </AuthShell>
  );
}
