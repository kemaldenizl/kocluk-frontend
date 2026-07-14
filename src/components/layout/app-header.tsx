import Link from "next/link";
import { Brand } from "./brand";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import { getSessionEmail, isAuthenticated } from "@/lib/auth/session";

/**
 * Sticky, auth-aware top navigation. Server component: reads the session cookie to
 * decide between sign-in actions and the account menu.
 */
export async function AppHeader() {
  const [authed, email] = await Promise.all([isAuthenticated(), getSessionEmail()]);

  return (
    <header className="sticky top-0 z-(--z-sticky) border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-(--spacing-container) items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {authed ? (
            <UserMenu email={email} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href={ROUTES.login}>Giriş yap</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={ROUTES.register}>Kayıt ol</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
