import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ChangePasswordConfirm } from "@/features/auth/components/change-password-confirm";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Şifre değiştir" };

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Yeni şifre belirle"
      description="Hesabın için yeni bir şifre oluştur."
      footer={
        <Link href={ROUTES.profile} className="font-medium text-brand hover:underline">
          Hesabıma dön
        </Link>
      }
    >
      <ChangePasswordConfirm token={token ?? ""} />
    </AuthShell>
  );
}
