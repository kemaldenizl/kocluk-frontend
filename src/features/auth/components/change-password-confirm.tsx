"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { ROUTES } from "@/config/constants";
import { newPasswordSchema, type NewPasswordInput } from "../schemas";
import { useChangePasswordConfirm } from "../hooks";

/**
 * Reached from the password-change link. The token is read from the URL; the user
 * only types the new password.
 */
export function ChangePasswordConfirm({ token }: { token: string }) {
  const confirm = useChangePasswordConfirm();

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await confirm.mutateAsync({
        token,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error" title="Bağlantı doğrulanamadı">
          Bağlantı geçersiz. Lütfen şifre değiştirme işlemini yeniden başlat.
        </Alert>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.profile}>Hesabıma dön</Link>
        </Button>
      </div>
    );
  }

  if (confirm.isSuccess) {
    return (
      <Alert variant="success" title="Şifre güncellendi">
        Şifren başarıyla değiştirildi.{" "}
        <Link href={ROUTES.login} className="font-medium text-brand hover:underline">
          Giriş yap
        </Link>
        .
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
      <Field
        label="Yeni şifre"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••••••"
        hint="En az 12 karakter."
        {...form.register("newPassword")}
        error={form.formState.errors.newPassword?.message}
      />
      <Field
        label="Yeni şifre (tekrar)"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••••••"
        {...form.register("confirmNewPassword")}
        error={form.formState.errors.confirmNewPassword?.message}
      />
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        Şifreyi değiştir
      </Button>
    </form>
  );
}
