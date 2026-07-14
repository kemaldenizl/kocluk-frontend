import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesabını oluştur"
      description="Birkaç adımda Koçluk'a başla."
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
