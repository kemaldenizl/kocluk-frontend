import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Şifreni sıfırla"
      description="E-postanı gir, sana bir sıfırlama bağlantısı gönderelim."
      footer={
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
