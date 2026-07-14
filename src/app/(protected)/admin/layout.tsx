import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { isAdmin } from "@/config/permissions";
import { REDIRECT_PARAM, ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { CurrentUser } from "@/features/profile/types";

export const metadata: Metadata = { title: "Yönetim" };

/**
 * Server-side authorization gate for the admin area. The proxy already guarantees an
 * authenticated session; here we additionally require an admin permission. This is a
 * UX gate — every admin endpoint is independently enforced by the backend (403).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const res = await callBackendWithAuth<CurrentUser>("/api/users/me");

  // Session missing/expired despite the proxy → send to login, remembering the target.
  if (res.status === 401) {
    redirect(`${ROUTES.login}?${REDIRECT_PARAM}=${ROUTES.admin}`);
  }

  if (!res.ok || !res.data || !isAdmin(res.data.permissions)) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <EmptyState
          icon={ShieldAlert}
          title="Bu alana erişimin yok"
          description="Yönetim paneli yalnızca yetkili kullanıcılar içindir. Bir hata olduğunu düşünüyorsan yöneticinle iletişime geç."
          action={
            <Button asChild variant="outline">
              <Link href={ROUTES.profile}>Hesabıma dön</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
