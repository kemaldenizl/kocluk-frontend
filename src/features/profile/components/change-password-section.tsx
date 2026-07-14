"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { changePasswordRequestSchema, type ChangePasswordRequestInput } from "@/features/auth/schemas";
import { useChangePasswordRequest } from "@/features/auth/hooks";

/**
 * Starts the password-change flow: verify the current password, then the backend
 * emails a confirmation link. The new password is set on the page that link opens.
 */
export function ChangePasswordSection() {
  const request = useChangePasswordRequest();

  const form = useForm<ChangePasswordRequestInput>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: { currentPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await request.mutateAsync(values);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifre değiştir</CardTitle>
        <CardDescription>Şifreni doğrula; e-posta adresine bir onay bağlantısı gönderelim.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {request.isSuccess ? (
            <Alert variant="success" title="Bağlantı gönderildi">
              {request.data.message}
            </Alert>
          ) : null}
          {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
          <Field
            label="Mevcut şifre"
            type="password"
            autoComplete="current-password"
            {...form.register("currentPassword")}
            error={form.formState.errors.currentPassword?.message}
          />
          <Button type="submit" variant="outline" className="self-start" loading={form.formState.isSubmitting}>
            Onay bağlantısı gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
