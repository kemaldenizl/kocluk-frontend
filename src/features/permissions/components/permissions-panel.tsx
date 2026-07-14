"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldLabelSpacer } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { createPermissionSchema, type CreatePermissionInput } from "../schemas";
import { useCreatePermission, useDeletePermission, usePermissions } from "../hooks";

/** Permission management: create and delete permission codes. */
export function PermissionsPanel({ canManage }: { canManage: boolean }) {
  const permissions = usePermissions();
  const remove = useDeletePermission();

  return (
    <div className="flex flex-col gap-6">
      {canManage ? <CreatePermissionForm /> : null}

      <Card>
        <CardHeader>
          <CardTitle>İzinler</CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.isPending ? (
            <ListSkeleton />
          ) : permissions.isError ? (
            <Alert variant="error" title="İzinler yüklenemedi">
              {getErrorMessage(permissions.error)}
            </Alert>
          ) : permissions.data.length === 0 ? (
            <EmptyState icon={KeyRound} title="Henüz izin yok" description="İlk izni oluşturarak başla." />
          ) : (
            <ul className="divide-y divide-border">
              {permissions.data.map((permission) => (
                <li key={permission.id} className="flex items-center justify-between gap-3 py-2.5">
                  <code className="truncate text-sm">{permission.code}</code>
                  {canManage ? (
                    <ConfirmButton
                      onConfirm={() => remove.mutate(permission.id)}
                      loading={remove.isPending && remove.variables === permission.id}
                    >
                      Sil
                    </ConfirmButton>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreatePermissionForm() {
  const create = useCreatePermission();
  const form = useForm<CreatePermissionInput>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      form.reset({ code: "" });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni izin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field
              label="Kod"
              placeholder="reports.read"
              hint="Biçim: alan.eylem"
              {...form.register("code")}
              error={form.formState.errors.code?.message ?? form.formState.errors.root?.message}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabelSpacer className="hidden sm:block" />
            <Button type="submit" loading={form.formState.isSubmitting}>
              İzin oluştur
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
