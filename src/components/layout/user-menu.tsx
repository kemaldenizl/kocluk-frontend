"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/constants";
import { isAdmin } from "@/config/permissions";
import { useLogout } from "@/features/auth/hooks";
import { useMe } from "@/features/profile/hooks";

/** Authenticated-user menu: profile shortcut, admin entry (if permitted), and sign out. */
export function UserMenu({ email }: { email?: string }) {
  const router = useRouter();
  const logout = useLogout();
  const { data: me } = useMe();
  const showAdmin = me ? isAdmin(me.permissions) : false;

  const onLogout = async () => {
    await logout.mutateAsync();
    router.replace(ROUTES.login);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"
        aria-label="Hesap menüsü"
      >
        <Avatar name={email} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-medium text-foreground">{email ?? "Giriş yapıldı"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile}>
            <User />
            Profil
          </Link>
        </DropdownMenuItem>
        {showAdmin ? (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.admin}>
              <Shield />
              Yönetim
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} disabled={logout.isPending}>
          <LogOut />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
