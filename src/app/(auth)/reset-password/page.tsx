import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Şifre sıfırla" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Yeni şifre belirle"
      description="Hesabına yeniden erişmek için yeni bir şifre oluştur."
      footer={
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ResetPasswordForm initialToken={token ?? ""} />
    </AuthShell>
  );
}
