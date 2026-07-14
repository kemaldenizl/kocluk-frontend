"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, Pencil, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldLabelSpacer } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { formatDateTime } from "@/lib/utils";
import {
  createTenantSchema,
  updateTenantSchema,
  type CreateTenantInput,
  type UpdateTenantInput,
} from "../schemas";
import {
  useActivateTenant,
  useCreateTenant,
  useDeactivateTenant,
  useDeleteTenant,
  useTenants,
  useUpdateTenant,
} from "../hooks";
import type { TenantResponse } from "../types";

/** Tenant management: create tenants and toggle/rename/delete existing ones. */
export function TenantsPanel({ canManage }: { canManage: boolean }) {
  const tenants = useTenants();

  return (
    <div className="flex flex-col gap-6">
      {canManage ? <CreateTenantForm /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Kiracılar</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.isPending ? (
            <ListSkeleton />
          ) : tenants.isError ? (
            <Alert variant="error" title="Kiracılar yüklenemedi">
              {getErrorMessage(tenants.error)}
            </Alert>
          ) : tenants.data.length === 0 ? (
            <EmptyState icon={Building2} title="Henüz kiracı yok" description="İlk kiracıyı oluşturarak başla." />
          ) : (
            <ul className="divide-y divide-border">
              {tenants.data.map((tenant) => (
                <TenantRow key={tenant.id} tenant={tenant} canManage={canManage} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateTenantForm() {
  const create = useCreateTenant();
  const form = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", slug: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      form.reset({ name: "", slug: "" });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni kiracı</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Ad"
              placeholder="Acme Inc."
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <Field
              label="Slug"
              optional
              placeholder="acme-inc"
              hint="Boş bırakılırsa addan türetilir."
              {...form.register("slug")}
              error={form.formState.errors.slug?.message}
            />
          </div>
          <Button type="submit" className="self-start" loading={form.formState.isSubmitting}>
            Kiracı oluştur
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TenantRow({ tenant, canManage }: { tenant: TenantResponse; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateTenant();
  const activate = useActivateTenant();
  const deactivate = useDeactivateTenant();
  const remove = useDeleteTenant();

  const form = useForm<UpdateTenantInput>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: { name: tenant.name },
  });

  const onRename = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: tenant.id, input: values });
      setEditing(false);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={onRename} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field
              label="Ad"
              {...form.register("name")}
              error={form.formState.errors.name?.message ?? form.formState.errors.root?.message}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabelSpacer className="hidden sm:block" />
            <div className="flex gap-1.5">
              <Button type="submit" size="sm" loading={form.formState.isSubmitting} aria-label="Kaydet">
                <Check className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  form.reset({ name: tenant.name });
                  setEditing(false);
                }}
                aria-label="Vazgeç"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{tenant.name}</span>
          <Badge variant={tenant.isActive ? "success" : "neutral"}>{tenant.isActive ? "Aktif" : "Pasif"}</Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-mono">{tenant.slug}</span> · Oluşturuldu {formatDateTime(tenant.createdAtUtc)}
        </p>
      </div>

      {canManage ? (
        <div className="flex shrink-0 items-center gap-1.5">
          {tenant.isActive ? (
            <Button
              size="sm"
              variant="outline"
              loading={deactivate.isPending}
              onClick={() => deactivate.mutate(tenant.id)}
            >
              Pasifleştir
            </Button>
          ) : (
            <Button size="sm" variant="outline" loading={activate.isPending} onClick={() => activate.mutate(tenant.id)}>
              Aktifleştir
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Yeniden adlandır">
            <Pencil className="size-4" />
          </Button>
          <ConfirmButton onConfirm={() => remove.mutate(tenant.id)} loading={remove.isPending}>
            Sil
          </ConfirmButton>
        </div>
      ) : null}
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}
