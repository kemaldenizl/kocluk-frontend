import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { VerifyEmailNotice } from "@/features/auth/components/verify-email-notice";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "E-posta doğrulaması gerekli" };

export default function VerifyEmailRequiredPage() {
  return (
    <AuthShell
      title="Neredeyse hazırsın"
      description="Hesabını kullanmaya başlamadan önce e-postanı doğrula."
      footer={
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Girişe dön
        </Link>
      }
    >
      <VerifyEmailNotice />
    </AuthShell>
  );
}
