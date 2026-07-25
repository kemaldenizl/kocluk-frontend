"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Pencil, Plus, ShieldCheck, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
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
import { usePermissions } from "@/features/permissions/hooks";
import { useTenantScope } from "@/features/tenants/hooks";
import { TenantSelect } from "@/features/tenants/components/tenant-select";
import { roleNameSchema, updateRoleSchema, type RoleNameInput, type UpdateRoleInput } from "../schemas";
import {
  useAddRolePermission,
  useCreateRole,
  useDeleteRole,
  useRemoveRolePermission,
  useRoles,
  useUpdateRole,
} from "../hooks";
import type { RoleResponse } from "../types";

type RolesPanelProps = {
  canManage: boolean;
  canReadPermissions: boolean;
};

/** Role management: create/rename/delete a tenant's roles and edit their permissions. */
export function RolesPanel({ canManage, canReadPermissions }: RolesPanelProps) {
  const { tenants, tenantId, setTenantId } = useTenantScope();
  const roles = useRoles(tenantId);

  return (
    <div className="flex flex-col gap-6">
      <TenantSelect tenants={tenants} value={tenantId} onChange={setTenantId} />

      {tenantId ? (
        <>
          {canManage ? <CreateRoleForm tenantId={tenantId} /> : null}

          <Card>
            <CardHeader>
              <CardTitle>Roller</CardTitle>
            </CardHeader>
            <CardContent>
              {roles.isPending ? (
                <ListSkeleton />
              ) : roles.isError ? (
                <Alert variant="error" title="Roller yüklenemedi">
                  {getErrorMessage(roles.error)}
                </Alert>
              ) : roles.data.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="Henüz rol yok" description="İlk rolü oluşturarak başla." />
              ) : (
                <ul className="flex flex-col gap-5">
                  {roles.data.map((role) => (
                    <RoleRow
                      key={role.id}
                      tenantId={tenantId}
                      role={role}
                      canManage={canManage}
                      canReadPermissions={canReadPermissions}
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

function CreateRoleForm({ tenantId }: { tenantId: string }) {
  const create = useCreateRole(tenantId);
  const form = useForm<RoleNameInput>({
    resolver: zodResolver(roleNameSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      form.reset({ name: "" });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni rol</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field
              label="Ad"
              placeholder="Danışman"
              {...form.register("name")}
              error={form.formState.errors.name?.message ?? form.formState.errors.root?.message}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabelSpacer className="hidden sm:block" />
            <Button type="submit" loading={form.formState.isSubmitting}>
              Rol oluştur
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RoleRow({
  tenantId,
  role,
  canManage,
  canReadPermissions,
}: { tenantId: string; role: RoleResponse } & RolesPanelProps) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateRole(tenantId);
  const remove = useDeleteRole(tenantId);
  const removePermission = useRemoveRolePermission(tenantId);

  const form = useForm<UpdateRoleInput>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { name: role.name },
  });

  const onRename = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: role.id, input: values });
      setEditing(false);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-surface/50 p-4">
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <form onSubmit={onRename} className="flex flex-1 items-start gap-1.5">
            <div className="flex-1">
              <Field
                label="Rol adı"
                {...form.register("name")}
                error={form.formState.errors.name?.message ?? form.formState.errors.root?.message}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabelSpacer />
              <div className="flex gap-1.5">
                <Button type="submit" size="sm" loading={form.formState.isSubmitting} aria-label="Kaydet">
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    form.reset({ name: role.name });
                    setEditing(false);
                  }}
                  aria-label="Vazgeç"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <span className="font-medium">{role.name}</span>
            {canManage ? (
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Yeniden adlandır">
                  <Pencil className="size-4" />
                </Button>
                <ConfirmButton onConfirm={() => remove.mutate(role.id)} loading={remove.isPending}>
                  Sil
                </ConfirmButton>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">İzinler</p>
        {role.permissions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((permission) => (
              <Badge key={permission.id} variant="outline" className="gap-1 font-mono text-[11px]">
                {permission.code}
                {canManage ? (
                  <button
                    type="button"
                    aria-label={`${permission.code} iznini kaldır`}
                    disabled={removePermission.isPending}
                    onClick={() => removePermission.mutate({ id: role.id, permissionId: permission.id })}
                    className="-mr-0.5 rounded-full text-muted-foreground transition-colors hover:text-error disabled:opacity-50 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Bu role atanmış izin yok.</p>
        )}

        {canManage && canReadPermissions ? <AddPermission tenantId={tenantId} role={role} /> : null}
      </div>
    </li>
  );
}

function AddPermission({ tenantId, role }: { tenantId: string; role: RoleResponse }) {
  const [selected, setSelected] = useState("");
  const add = useAddRolePermission(tenantId);
  const permissions = usePermissions();

  const assignedIds = useMemo(() => new Set(role.permissions.map((p) => p.id)), [role.permissions]);
  const available = useMemo(
    () => (permissions.data ?? []).filter((p) => !assignedIds.has(p.id)),
    [permissions.data, assignedIds],
  );

  if (permissions.isError) {
    return <p className="text-xs text-error">İzin listesi yüklenemedi.</p>;
  }
  if (available.length === 0) {
    return null;
  }

  const onAdd = async () => {
    if (!selected) return;
    await add.mutateAsync({ id: role.id, permissionId: selected });
    setSelected("");
  };

  return (
    <div className="flex items-end gap-2">
      <div className="w-full max-w-xs">
        <SelectField
          label="İzin ekle"
          placeholder="İzin seç"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={available.map((p) => ({ value: p.id, label: p.code }))}
        />
      </div>
      <Button type="button" variant="outline" onClick={onAdd} disabled={!selected} loading={add.isPending}>
        <Plus className="size-4" />
        Ekle
      </Button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-64" />
        </div>
      ))}
    </div>
  );
}
