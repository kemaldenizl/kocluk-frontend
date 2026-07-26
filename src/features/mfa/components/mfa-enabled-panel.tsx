"use client";

import { useState } from "react";
import { RefreshCw, ShieldOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/api/error-message";
import { MfaCodeForm, type MfaCodeSubmit } from "./mfa-code-form";
import { useDisableMfa, useRegenerateRecoveryCodes } from "../hooks";

type Action = "none" | "regenerate" | "disable";

/**
 * Management view shown when MFA is already on: regenerate recovery codes (TOTP only)
 * or turn MFA off (TOTP or recovery code). Only one action form is open at a time.
 * Fresh recovery codes from a regeneration bubble up via {@link onRegenerated}.
 */
export function MfaEnabledPanel({ onRegenerated }: { onRegenerated: (codes: string[]) => void }) {
  const [action, setAction] = useState<Action>("none");
  const disable = useDisableMfa();
  const regenerate = useRegenerateRecoveryCodes();

  const onRegenerate = async ({ code }: MfaCodeSubmit) => {
    const { recoveryCodes } = await regenerate.mutateAsync({ totpCode: code });
    setAction("none");
    onRegenerated(recoveryCodes);
  };

  const onDisable = async ({ code, useRecovery }: MfaCodeSubmit) => {
    await disable.mutateAsync(useRecovery ? { recoveryCode: code } : { totpCode: code });
    // Status is invalidated by the hook; the manager re-renders to the setup view.
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert variant="success" title="İki adımlı doğrulama etkin">
        Girişlerin ek bir doğrulama koduyla korunuyor.
      </Alert>

      {/* Regenerate recovery codes */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="t-h4">Kurtarma kodları</h3>
          <p className="text-sm text-muted-foreground">
            Kodlarını kaybettiysen yenilerini oluştur. Eski kodların geçersiz olur.
          </p>
        </div>
        {action === "regenerate" ? (
          <MfaCodeForm
            onSubmit={onRegenerate}
            submitLabel="Kodları yenile"
            submitVariant="outline"
            pending={regenerate.isPending}
            error={regenerate.isError ? getErrorMessage(regenerate.error) : null}
            autoFocus
          />
        ) : (
          <Button type="button" variant="outline" className="self-start" onClick={() => setAction("regenerate")}>
            <RefreshCw className="size-4" />
            Kurtarma kodlarını yenile
          </Button>
        )}
      </section>

      <Separator />

      {/* Disable MFA */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="t-h4">İki adımlı doğrulamayı kapat</h3>
          <p className="text-sm text-muted-foreground">
            Kapatmak için doğrulama kodunu ya da bir kurtarma kodunu gir. Hesabın yalnızca şifreyle korunur.
          </p>
        </div>
        {action === "disable" ? (
          <MfaCodeForm
            onSubmit={onDisable}
            submitLabel="Doğrulamayı kapat"
            submitVariant="destructive"
            pending={disable.isPending}
            error={disable.isError ? getErrorMessage(disable.error) : null}
            allowRecovery
            autoFocus
          />
        ) : (
          <Button type="button" variant="outline" className="self-start" onClick={() => setAction("disable")}>
            <ShieldOff className="size-4" />
            İki adımlı doğrulamayı kapat
          </Button>
        )}
      </section>
    </div>
  );
}
