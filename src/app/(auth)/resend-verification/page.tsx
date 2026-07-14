import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Doğrulamayı tekrar gönder" };

export default function ResendVerificationPage() {
  return (
    <AuthShell
      title="Doğrulamayı tekrar gönder"
      description="Hesabın hâlâ doğrulanmadıysa yeni bir bağlantı gönderelim."
      footer={
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ResendVerificationForm />
    </AuthShell>
  );
}
