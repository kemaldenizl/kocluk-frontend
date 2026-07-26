"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error-message";
import { useMfaStatus } from "../hooks";
import { MfaSetupFlow } from "./mfa-setup-flow";
import { MfaEnabledPanel } from "./mfa-enabled-panel";
import { RecoveryCodes } from "./recovery-codes";

/** How a fresh set of recovery codes came to be shown, for the right heading/copy. */
type CodesOrigin = "enabled" | "regenerated";

/**
 * Top-level MFA screen. Reads the enabled state, then renders the enrolment wizard or
 * the management panel. When either produces recovery codes it shows them on a
 * terminal panel that the user dismisses explicitly — so the one-time codes are never
 * swept away by the status flipping underneath.
 */
export function MfaManager() {
  const status = useMfaStatus();
  const [codes, setCodes] = useState<{ values: string[]; origin: CodesOrigin } | null>(null);

  if (status.isPending) return <MfaCardSkeleton />;
  if (status.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="error" title="Durum yüklenemedi">
            {getErrorMessage(status.error)}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (codes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{codes.origin === "enabled" ? "İki adımlı doğrulama etkinleştirildi" : "Yeni kurtarma kodların"}</CardTitle>
          <CardDescription>
            {codes.origin === "enabled"
              ? "Artık girişte kimlik doğrulayıcı kodun istenecek. Kurtarma kodlarını sakla."
              : "Eski kurtarma kodların artık geçersiz. Yenilerini güvenle sakla."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RecoveryCodes codes={codes.values} />
          <Button type="button" className="self-start" onClick={() => setCodes(null)}>
            Sakladım, tamam
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İki adımlı doğrulama</CardTitle>
        <CardDescription>
          {status.data.enabled
            ? "Hesabın ek bir doğrulama koduyla korunuyor."
            : "Hesabına ekstra bir güvenlik katmanı ekle."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.data.enabled ? (
          <MfaEnabledPanel onRegenerated={(values) => setCodes({ values, origin: "regenerated" })} />
        ) : (
          <MfaSetupFlow onEnabled={(values) => setCodes({ values, origin: "enabled" })} />
        )}
      </CardContent>
    </Card>
  );
}

function MfaCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-40" />
      </CardContent>
    </Card>
  );
}
