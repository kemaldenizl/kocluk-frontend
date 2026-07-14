import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ChangeEmailConfirm } from "@/features/auth/components/change-email-confirm";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "E-posta değiştir" };

export default async function ChangeEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="E-posta adresini değiştir"
      description="Bağlantını doğruladık. Yeni e-posta adresini belirle."
      footer={
        <Link href={ROUTES.profile} className="font-medium text-brand hover:underline">
          Hesabıma dön
        </Link>
      }
    >
      <ChangeEmailConfirm token={token ?? ""} />
    </AuthShell>
  );
}
