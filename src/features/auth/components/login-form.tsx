"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { getErrorMessage } from "@/lib/api/error-message";
import { REDIRECT_PARAM, ROUTES } from "@/config/constants";
import { loginSchema, type LoginInput } from "../schemas";
import { setPendingVerificationEmail } from "../pending-verification";
import { useLogin } from "../hooks";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync(values);
      if (result.requiresEmailVerification) {
        // No session was issued; hand the email to the notice page (out of the URL).
        setPendingVerificationEmail(values.email);
        router.replace(ROUTES.verifyEmailNotice);
        return;
      }
      if (result.requiresMfa) {
        form.setError("root", { message: "Bu hesap için iki adımlı doğrulama gerekli (henüz eklenmedi)." });
        return;
      }
      const target = searchParams.get(REDIRECT_PARAM) || ROUTES.profile;
      router.replace(target);
      // Re-render server components (e.g. the auth-aware header) with the new session.
      router.refresh();
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {form.formState.errors.root ? <Alert variant="error">{form.formState.errors.root.message}</Alert> : null}
      <Field label="E-posta" type="email" autoComplete="email" placeholder="ornek@eposta.com" {...form.register("email")} error={form.formState.errors.email?.message} />
      <div className="flex flex-col gap-1.5">
        <Field
          label="Şifre"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <Link href={ROUTES.forgotPassword} className="self-end text-xs font-medium text-brand hover:underline">
          Şifreni mi unuttun?
        </Link>
      </div>
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        Giriş yap
      </Button>
    </form>
  );
}
