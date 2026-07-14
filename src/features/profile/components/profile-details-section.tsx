"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { STUDENT_TYPE_OPTIONS } from "@/config/student-type";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas";
import { useMe, useUpdateProfile } from "../hooks";

/** Editable identity: name + student type, saved via `PUT /api/users/me/update`. */
export function ProfileDetailsSection() {
  const me = useMe();
  const update = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      studentType: "" as UpdateProfileInput["studentType"],
    },
  });

  // Prefill once the current user loads (and after a successful save re-fetch).
  const { reset } = form;
  useEffect(() => {
    if (me.data) {
      reset({
        firstName: me.data.firstName ?? "",
        lastName: me.data.lastName ?? "",
        studentType: (me.data.studentType ?? "") as UpdateProfileInput["studentType"],
      });
    }
  }, [me.data, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kişisel bilgiler</CardTitle>
        <CardDescription>Adını, soyadını ve öğrenim durumunu güncelle.</CardDescription>
      </CardHeader>
      <CardContent>
        {me.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : me.isError ? (
          <Alert variant="error" title="Bilgiler yüklenemedi">
            {getErrorMessage(me.error)}
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {update.isSuccess && !form.formState.isDirty ? (
              <Alert variant="success" title="Kaydedildi">
                Bilgilerin güncellendi.
              </Alert>
            ) : null}
            {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Ad"
                autoComplete="given-name"
                {...form.register("firstName")}
                error={form.formState.errors.firstName?.message}
              />
              <Field
                label="Soyad"
                autoComplete="family-name"
                {...form.register("lastName")}
                error={form.formState.errors.lastName?.message}
              />
            </div>
            <SelectField
              label="Öğrenim durumu"
              placeholder="Öğrenim durumunu seç"
              options={STUDENT_TYPE_OPTIONS}
              {...form.register("studentType")}
              error={form.formState.errors.studentType?.message}
            />
            <Button
              type="submit"
              variant="outline"
              className="self-start"
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
            >
              Değişiklikleri kaydet
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
