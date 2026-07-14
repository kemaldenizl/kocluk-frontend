"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/error-message";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";
import { useForgotPassword } from "../hooks";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await forgot.mutateAsync(values);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {forgot.isSuccess ? <Alert variant="success">{forgot.data.message}</Alert> : null}
      {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
      <Field label="E-posta" type="email" autoComplete="email" placeholder="ornek@eposta.com" {...form.register("email")} error={form.formState.errors.email?.message} />
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        Sıfırlama bağlantısı gönder
      </Button>
    </form>
  );
}
