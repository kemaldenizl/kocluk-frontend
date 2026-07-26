"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { Alert } from "@/components/ui/alert";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { STUDENT_TYPE_OPTIONS } from "@/config/student-type";
import { registerSchema, type RegisterInput } from "../schemas";
import { ResendVerificationButton } from "./resend-verification-button";
import { useRegister } from "../hooks";

export function RegisterForm() {
  const register = useRegister();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      // Empty until the user picks a valid enum name; validated by the schema on submit.
      studentType: "" as RegisterInput["studentType"],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register.mutateAsync(values);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  if (register.isSuccess) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="success" title="Hesabın oluşturuldu">
          <strong className="text-foreground">{register.data.user.email}</strong> adresine bir doğrulama bağlantısı
          gönderdik. Kurulumu tamamlamak için gelen kutunu kontrol et.
        </Alert>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">E-posta gelmediyse tekrar gönderebilirsin.</p>
          <ResendVerificationButton email={register.data.user.email} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Ad"
          autoComplete="given-name"
          placeholder="Ahmet"
          {...form.register("firstName")}
          error={form.formState.errors.firstName?.message}
        />
        <Field
          label="Soyad"
          autoComplete="family-name"
          placeholder="Yılmaz"
          {...form.register("lastName")}
          error={form.formState.errors.lastName?.message}
        />
      </div>
      <Field label="E-posta" type="email" autoComplete="email" placeholder="ornek@eposta.com" {...form.register("email")} error={form.formState.errors.email?.message} />
      <SelectField
        label="Öğrenim durumu"
        placeholder="Öğrenim durumunu seç"
        options={STUDENT_TYPE_OPTIONS}
        {...form.register("studentType")}
        error={form.formState.errors.studentType?.message}
      />
      <Field
        label="Şifre"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••••••"
        hint="En az 12 karakter."
        {...form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <Field
        label="Şifre (tekrar)"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••••••"
        {...form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        Hesap oluştur
      </Button>
    </form>
  );
}
