"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import {
  recoveryCodeFormSchema,
  totpCodeFormSchema,
  type TotpCodeFormInput,
} from "../schemas";

/** What the parent receives on submit — the raw code plus which credential it is. */
export interface MfaCodeSubmit {
  code: string;
  useRecovery: boolean;
}

interface MfaCodeFormProps {
  /** Called with the validated code. The parent maps it to the API request shape. */
  onSubmit: (value: MfaCodeSubmit) => void | Promise<void>;
  submitLabel: string;
  submitVariant?: "primary" | "outline" | "destructive";
  pending?: boolean;
  /** Server-side error to surface (e.g. wrong/expired code). */
  error?: string | null;
  /** Offer a "use a recovery code instead" toggle. Off for TOTP-only actions. */
  allowRecovery?: boolean;
  autoFocus?: boolean;
}

/**
 * Single-field verification form shared by the MFA login challenge, disable, and
 * recovery-code regeneration screens. When {@link MfaCodeFormProps.allowRecovery} is
 * set the user can switch between a 6-digit TOTP code and a one-time recovery code;
 * the active mode selects the matching zod schema.
 */
export function MfaCodeForm({
  onSubmit,
  submitLabel,
  submitVariant = "primary",
  pending = false,
  error,
  allowRecovery = false,
  autoFocus = false,
}: MfaCodeFormProps) {
  const [useRecovery, setUseRecovery] = useState(false);
  const form = useForm<TotpCodeFormInput>({
    resolver: zodResolver(useRecovery ? recoveryCodeFormSchema : totpCodeFormSchema),
    defaultValues: { code: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({ code: values.code, useRecovery });
  });

  const toggleMode = () => {
    setUseRecovery((v) => !v);
    form.reset({ code: "" });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Field
        label={useRecovery ? "Kurtarma kodu" : "Doğrulama kodu"}
        inputMode={useRecovery ? "text" : "numeric"}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        placeholder={useRecovery ? "ab12-cd34" : "123456"}
        hint={
          useRecovery
            ? "Daha önce kaydettiğin tek seferlik kurtarma kodlarından birini gir."
            : "Kimlik doğrulayıcı uygulamandaki 6 haneli kodu gir."
        }
        {...form.register("code")}
        error={form.formState.errors.code?.message}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={submitVariant} loading={pending || form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        {allowRecovery ? (
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm font-medium text-brand hover:underline"
          >
            {useRecovery ? "Doğrulama kodu kullan" : "Kurtarma kodu kullan"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
