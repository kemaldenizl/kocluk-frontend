import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "E-posta doğrula" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="E-postanı doğrula"
      description="Hesabını etkinleştirmek için e-posta adresini onayla."
      footer={
        <Link href={ROUTES.resendVerification} className="font-medium text-brand hover:underline">
          Ulaşmadı mı? Tekrar gönder
        </Link>
      }
    >
      <VerifyEmailForm initialToken={token ?? ""} />
    </AuthShell>
  );
}
