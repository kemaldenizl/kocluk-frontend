"use client";

import { useMemo, useState } from "react";
import { Building2, KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error-message";
import {
  canManageMembers,
  canManagePermissions,
  canManageRoles,
  canManageTenants,
  canReadMembers,
  canReadPermissions,
  canReadRoles,
  canReadTenants,
} from "@/config/permissions";
import { useMe } from "@/features/profile/hooks";
import { TenantsPanel } from "@/features/tenants/components/tenants-panel";
import { MembersPanel } from "@/features/members/components/members-panel";
import { RolesPanel } from "@/features/roles/components/roles-panel";
import { PermissionsPanel } from "@/features/permissions/components/permissions-panel";

type TabId = "tenants" | "members" | "roles" | "permissions";
type Tab = { id: TabId; label: string; icon: React.ComponentType<LucideProps>; render: () => React.ReactNode };

/** Admin console — tenant, role, and permission management, gated per capability. */
export default function AdminPage() {
  const { data, isPending, isError, error } = useMe();

  const tabs = useMemo<Tab[]>(() => {
    if (!data) return [];
    const perms = data.permissions;
    const list: Tab[] = [];
    if (canReadTenants(perms)) {
      list.push({
        id: "tenants",
        label: "Kiracılar",
        icon: Building2,
        render: () => <TenantsPanel canManage={canManageTenants(perms)} />,
      });
    }
    if (canReadMembers(perms)) {
      list.push({
        id: "members",
        label: "Üyeler",
        icon: UsersRound,
        render: () => <MembersPanel canManage={canManageMembers(perms)} canReadRoles={canReadRoles(perms)} />,
      });
    }
    if (canReadRoles(perms)) {
      list.push({
        id: "roles",
        label: "Roller",
        icon: ShieldCheck,
        render: () => <RolesPanel canManage={canManageRoles(perms)} canReadPermissions={canReadPermissions(perms)} />,
      });
    }
    if (canReadPermissions(perms)) {
      list.push({
        id: "permissions",
        label: "İzinler",
        icon: KeyRound,
        render: () => <PermissionsPanel canManage={canManagePermissions(perms)} />,
      });
    }
    return list;
  }, [data]);

  const [activeId, setActiveId] = useState<TabId | null>(null);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="t-h1">Yönetim</h1>
        <p className="text-sm text-muted-foreground">Kiracıları, üyeleri, rolleri ve izinleri yönet.</p>
      </header>

      {isPending ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="error" title="Yönetim paneli yüklenemedi">
          {getErrorMessage(error)}
        </Alert>
      ) : tabs.length === 0 ? (
        <Alert variant="warning" title="Görüntülenecek bir alan yok">
          Herhangi bir yönetim alanı için okuma iznin bulunmuyor.
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <div role="tablist" aria-label="Yönetim alanları" className="flex flex-wrap gap-1 rounded-lg border bg-surface p-1">
            {tabs.map((tab) => {
              const selected = tab.id === active?.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer",
                    selected
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {active?.render()}
        </div>
      )}
    </div>
  );
}
