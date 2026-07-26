import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MfaManager } from "@/features/mfa/components/mfa-manager";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = { title: "İki adımlı doğrulama" };

/** Protected — the proxy guarantees a session before this renders. */
export default function MfaPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={ROUTES.profile}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Hesaba dön
        </Link>
        <header className="flex flex-col gap-1">
          <h1 className="t-h1">İki adımlı doğrulama</h1>
          <p className="text-sm text-muted-foreground">
            Girişlerini kimlik doğrulayıcı uygulamandan üretilen tek seferlik kodlarla güçlendir.
          </p>
        </header>
      </div>

      <MfaManager />
    </div>
  );
}
