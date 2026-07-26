"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/constants";
import { useMfaStatus } from "../hooks";

/**
 * Profile-page entry point for MFA: shows the current on/off state and links to the
 * dedicated management screen. The detailed enable/disable flows live on that page.
 */
export function MfaSummaryCard() {
  const status = useMfaStatus();
  const enabled = status.data?.enabled ?? false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>İki adımlı doğrulama</CardTitle>
          {status.isSuccess ? (
            <Badge variant={enabled ? "success" : "neutral"}>{enabled ? "Etkin" : "Kapalı"}</Badge>
          ) : null}
        </div>
        <CardDescription>
          Girişte şifrenin yanında kimlik doğrulayıcı uygulamandan bir kod isteyerek hesabını korur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <Button variant={enabled ? "outline" : "primary"} className="self-start" asChild>
            <Link href={ROUTES.mfa}>
              <ShieldCheck className="size-4" />
              {enabled ? "İki adımlı doğrulamayı yönet" : "İki adımlı doğrulamayı aç"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
