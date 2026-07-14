"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { ROUTES } from "@/config/constants";
import { newEmailSchema, type NewEmailInput } from "../schemas";
import { useChangeEmailConfirm, useValidateEmailChangeToken } from "../hooks";

/**
 * Reached from the email-change link. The token is read from the URL and validated
 * automatically; the user never types it — they only enter the new email address.
 */
export function ChangeEmailConfirm({ token }: { token: string }) {
  const validation = useValidateEmailChangeToken(token);
  const confirm = useChangeEmailConfirm();

  const form = useForm<NewEmailInput>({
    resolver: zodResolver(newEmailSchema),
    defaultValues: { newEmail: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await confirm.mutateAsync({ token, newEmail: values.newEmail });
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  if (!token) {
    return <InvalidLink message="Bağlantı geçersiz. Lütfen e-posta değiştirme işlemini yeniden başlat." />;
  }

  if (validation.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Bağlantı doğrulanıyor…
      </div>
    );
  }

  if (validation.isError || !validation.data?.isValid) {
    return <InvalidLink message={validation.data?.message ?? "Bağlantının süresi dolmuş veya geçersiz."} />;
  }

  if (confirm.isSuccess) {
    return (
      <Alert variant="success" title="E-posta güncellendi">
        E-posta adresin başarıyla değiştirildi.{" "}
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
        label="Yeni e-posta"
        type="email"
        autoComplete="email"
        placeholder="yeni@ornek.com"
        {...form.register("newEmail")}
        error={form.formState.errors.newEmail?.message}
      />
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        E-postayı değiştir
      </Button>
    </form>
  );
}

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="Bağlantı doğrulanamadı">
        {message}
      </Alert>
      <Button variant="outline" className="w-full" asChild>
        <Link href={ROUTES.profile}>Hesabıma dön</Link>
      </Button>
    </div>
  );
}
