"use client";

import { Monitor } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error-message";
import { formatDateTime } from "@/lib/utils";
import { useRevokeSession, useSessions } from "../hooks";

/** Lists the user's active sessions and lets them revoke any but the current one. */
export function SessionsSection() {
  const sessions = useSessions();
  const revoke = useRevokeSession();

  const active = sessions.data?.filter((s) => !s.revoked) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oturumlar</CardTitle>
        <CardDescription>Hesabına bağlı cihazlar. Tanımadığın bir oturumu sonlandır.</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.isPending ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : sessions.isError ? (
          <Alert variant="error" title="Oturumlar yüklenemedi">
            {getErrorMessage(sessions.error)}
          </Alert>
        ) : active.length === 0 ? (
          <EmptyState icon={Monitor} title="Aktif oturum yok" />
        ) : (
          <ul className="divide-y divide-border">
            {active.map((session) => (
              <li
                key={session.sessionId}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{session.deviceName || "Bilinmeyen cihaz"}</span>
                    {session.isCurrent ? <Badge variant="brand">Bu oturum</Badge> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.ipAddress ? `${session.ipAddress} · ` : ""}
                    Başladı {formatDateTime(session.createdAtUtc)}
                  </p>
                </div>
                {!session.isCurrent ? (
                  <ConfirmButton
                    onConfirm={() => revoke.mutate(session.sessionId)}
                    loading={revoke.isPending && revoke.variables === session.sessionId}
                    confirmLabel="Sonlandır"
                  >
                    Sonlandır
                  </ConfirmButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
