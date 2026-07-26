"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/api/error-message";
import { applyFieldErrors } from "@/lib/api/apply-field-errors";
import { mfaSetupCompleteSchema, type MfaSetupCompleteInput } from "../schemas";
import type { MfaSetupBeginResult } from "../types";
import { useBeginMfaSetup, useCompleteMfaSetup } from "../hooks";
import { QrCode } from "./qr-code";

/**
 * Two-step enrolment wizard:
 *  1. Fetch the QR / manual key (`setup/begin`).
 *  2. Scan it, enter the 6-digit code, and confirm (`setup/complete`).
 *
 * On success the fresh recovery codes are handed to {@link onEnabled}; the parent owns
 * showing them so they survive the status flipping to "enabled".
 */
export function MfaSetupFlow({ onEnabled }: { onEnabled: (codes: string[]) => void }) {
  const begin = useBeginMfaSetup();

  if (!begin.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          İki adımlı doğrulama, girişte şifrenin yanında kimlik doğrulayıcı uygulamandan üretilen bir kod
          da ister. Böylece şifren ele geçse bile hesabın korunur.
        </p>
        {begin.isError ? <Alert variant="error">{getErrorMessage(begin.error)}</Alert> : null}
        <Button
          type="button"
          className="self-start"
          loading={begin.isPending}
          onClick={() => begin.mutate()}
        >
          <ShieldCheck className="size-4" />
          Kurulumu başlat
        </Button>
      </div>
    );
  }

  return <MfaSetupVerify setup={begin.data} onEnabled={onEnabled} />;
}

/** Step 2: render the QR + manual key and verify the first code. */
function MfaSetupVerify({
  setup,
  onEnabled,
}: {
  setup: MfaSetupBeginResult;
  onEnabled: (codes: string[]) => void;
}) {
  const complete = useCompleteMfaSetup();

  const form = useForm<MfaSetupCompleteInput>({
    resolver: zodResolver(mfaSetupCompleteSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const { recoveryCodes } = await complete.mutateAsync(values);
      onEnabled(recoveryCodes);
    } catch (error) {
      if (!applyFieldErrors(error, form.setError)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-6">
        <li className="flex flex-col gap-3">
          <StepHeading n={1} title="Kimlik doğrulayıcı uygulamanla tara" />
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <QrCode value={setup.otpAuthUri} label="İki adımlı doğrulama QR kodu" />
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Google Authenticator, 1Password, Authy gibi bir uygulamayla QR kodu tara.</p>
              <p>QR kodu tarayamıyorsan bu anahtarı elle gir:</p>
              <code className="w-fit break-all rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-foreground">
                {setup.manualEntryKey}
              </code>
            </div>
          </div>
        </li>

        <li className="flex flex-col gap-3">
          <StepHeading n={2} title="Uygulamadaki kodu gir" />
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {form.formState.errors.root ? (
              <Alert variant="error">{form.formState.errors.root.message}</Alert>
            ) : null}
            <Field
              label="Doğrulama kodu"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="max-w-40"
              {...form.register("code")}
              error={form.formState.errors.code?.message}
            />
            <Button type="submit" className="self-start" loading={form.formState.isSubmitting}>
              Doğrula ve etkinleştir
            </Button>
          </form>
        </li>
      </ol>
    </div>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <h3 className="t-h4">{title}</h3>
    </div>
  );
}
