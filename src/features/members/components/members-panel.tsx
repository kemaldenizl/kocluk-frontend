"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserPlus, Users, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldLabelSpacer } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { formatDateTime } from "@/lib/utils";
import { useTenantScope } from "@/features/tenants/hooks";
import { TenantSelect } from "@/features/tenants/components/tenant-select";
import { useRoles } from "@/features/roles/hooks";
import type { RoleResponse } from "@/features/roles/types";
import { addMemberFormSchema, type AddMemberFormInput } from "../schemas";
import {
  useAddMember,
  useGrantMemberRole,
  useMembers,
  useReactivateMember,
  useRemoveMember,
  useRemoveMemberRole,
  useSuspendMember,
} from "../hooks";
import type { MembershipStatus, TenantMember } from "../types";

type MembersPanelProps = {
  canManage: boolean;
  canReadRoles: boolean;
};

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "neutral" }> = {
  Active: { label: "Aktif", variant: "success" },
  Suspended: { label: "Askıda", variant: "warning" },
  Removed: { label: "Çıkarıldı", variant: "neutral" },
};

function statusMeta(status: MembershipStatus) {
  return STATUS_META[status] ?? { label: status, variant: "neutral" as const };
}

/** Member management for a tenant: add users, manage their roles, suspend/reactivate/remove. */
export function MembersPanel({ canManage, canReadRoles }: MembersPanelProps) {
  const { tenants, tenantId, setTenantId } = useTenantScope();
  const members = useMembers(tenantId);

  return (
    <div className="flex flex-col gap-6">
      <TenantSelect tenants={tenants} value={tenantId} onChange={setTenantId} />

      {tenantId ? (
        <>
          {canManage ? <AddMemberForm tenantId={tenantId} /> : null}

          <Card>
            <CardHeader>
              <CardTitle>Üyeler</CardTitle>
            </CardHeader>
            <CardContent>
              {members.isPending ? (
                <ListSkeleton />
              ) : members.isError ? (
                <Alert variant="error" title="Üyeler yüklenemedi">
                  {getErrorMessage(members.error)}
                </Alert>
              ) : members.data.length === 0 ? (
                <EmptyState icon={Users} title="Henüz üye yok" description="Bir kullanıcıyı e-postasıyla ekle." />
              ) : (
                <ul className="flex flex-col gap-4">
                  {members.data.map((member) => (
                    <MemberRow
                      key={member.userId}
                      tenantId={tenantId}
                      member={member}
                      canManage={canManage}
                      canReadRoles={canReadRoles}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function AddMemberForm({ tenantId }: { tenantId: string }) {
  const add = useAddMember(tenantId);
  const form = useForm<AddMemberFormInput>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await add.mutateAsync(values.email);
      form.reset({ email: "" });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Üye ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field
              label="Kullanıcı e-postası"
              type="email"
              placeholder="ornek@eposta.com"
              hint="Kullanıcının zaten bir hesabı olmalı."
              {...form.register("email")}
              error={form.formState.errors.email?.message ?? form.formState.errors.root?.message}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabelSpacer className="hidden sm:block" />
            <Button type="submit" loading={form.formState.isSubmitting}>
              <UserPlus className="size-4" />
              Ekle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MemberRow({
  tenantId,
  member,
  canManage,
  canReadRoles,
}: { tenantId: string; member: TenantMember } & MembersPanelProps) {
  const suspend = useSuspendMember(tenantId);
  const reactivate = useReactivateMember(tenantId);
  const remove = useRemoveMember(tenantId);

  const status = statusMeta(member.status);
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
  const busy = suspend.isPending || reactivate.isPending || remove.isPending;

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-surface/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={fullName || member.email} />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{fullName || member.email}</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {fullName ? `${member.email} · ` : ""}Katıldı {formatDateTime(member.joinedAtUtc)}
            </p>
          </div>
        </div>

        {canManage ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {member.status === "Active" ? (
              <Button size="sm" variant="outline" loading={suspend.isPending} onClick={() => suspend.mutate(member.userId)}>
                Askıya al
              </Button>
            ) : null}
            {member.status === "Suspended" || member.status === "Removed" ? (
              <Button
                size="sm"
                variant="outline"
                loading={reactivate.isPending}
                onClick={() => reactivate.mutate(member.userId)}
              >
                Yeniden aktifleştir
              </Button>
            ) : null}
            {member.status !== "Removed" ? (
              <ConfirmButton onConfirm={() => remove.mutate(member.userId)} loading={remove.isPending} disabled={busy}>
                Çıkar
              </ConfirmButton>
            ) : null}
          </div>
        ) : null}
      </div>

      {canReadRoles ? (
        <MemberRoles tenantId={tenantId} member={member} canManage={canManage} />
      ) : (
        <MemberRolesReadonly roles={member.roles} />
      )}
    </li>
  );
}

/** Read-only role chips (role names) when the viewer can't read the tenant's role catalogue. */
function MemberRolesReadonly({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Roller</p>
      {roles.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {roles.map((role) => (
            <Badge key={role} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Atanmış rol yok.</p>
      )}
    </div>
  );
}

function MemberRoles({
  tenantId,
  member,
  canManage,
}: {
  tenantId: string;
  member: TenantMember;
  canManage: boolean;
}) {
  const [selected, setSelected] = useState("");
  const roles = useRoles(tenantId);
  const grant = useGrantMemberRole(tenantId);
  const removeRole = useRemoveMemberRole(tenantId);

  // The member list gives role *names*; grant/remove need role *ids* — map via the catalogue.
  const roleByName = useMemo(() => {
    const map = new Map<string, RoleResponse>();
    for (const role of roles.data ?? []) map.set(role.name, role);
    return map;
  }, [roles.data]);

  const assigned = useMemo(() => new Set(member.roles), [member.roles]);
  const available = useMemo(
    () => (roles.data ?? []).filter((role) => !assigned.has(role.name)),
    [roles.data, assigned],
  );

  const onGrant = async () => {
    if (!selected) return;
    await grant.mutateAsync({ userId: member.userId, roleId: selected });
    setSelected("");
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Roller</p>

      {member.roles.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {member.roles.map((name) => {
            const role = roleByName.get(name);
            return (
              <Badge key={name} variant="outline">
                {name}
                {canManage && role ? (
                  <button
                    type="button"
                    aria-label={`${name} rolünü kaldır`}
                    disabled={removeRole.isPending}
                    onClick={() => removeRole.mutate({ userId: member.userId, roleId: role.id })}
                    className="-mr-0.5 rounded-full text-muted-foreground transition-colors hover:text-error disabled:opacity-50 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </Badge>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Atanmış rol yok.</p>
      )}

      {canManage ? (
        roles.isError ? (
          <p className="text-xs text-error">Rol listesi yüklenemedi.</p>
        ) : available.length > 0 ? (
          <div className="flex items-end gap-2">
            <div className="w-full max-w-xs">
              <SelectField
                label="Rol ata"
                placeholder="Rol seç"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                options={available.map((role) => ({ value: role.id, label: role.name }))}
              />
            </div>
            <Button type="button" variant="outline" onClick={onGrant} disabled={!selected} loading={grant.isPending}>
              <Plus className="size-4" />
              Ata
            </Button>
          </div>
        ) : null
      ) : null}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-6 w-48" />
        </div>
      ))}
    </div>
  );
}
