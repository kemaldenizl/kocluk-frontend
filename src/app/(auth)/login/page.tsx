import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Giriş yap" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Tekrar hoş geldin"
      description="Devam etmek için Koçluk hesabına giriş yap."
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href={ROUTES.register} className="font-medium text-brand hover:underline">
            Kayıt ol
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
