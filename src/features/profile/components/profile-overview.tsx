"use client";

import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error-message";
import { studentTypeLabel } from "@/config/student-type";
import { useMe } from "../hooks";

/** Read-only identity card: who you are, your session, and resolved permissions. */
export function ProfileOverview() {
  const { data, isPending, isError, error } = useMe();

  if (isPending) return <ProfileOverviewSkeleton />;
  if (isError) return <Alert variant="error" title="Profilin yüklenemedi">{getErrorMessage(error)}</Alert>;

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  const studentLabel = studentTypeLabel(data.studentType);

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={fullName || data.email} className="size-12 text-sm" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate font-medium">{fullName || data.email}</p>
            <p className="truncate text-sm text-muted-foreground">{data.email}</p>
            {studentLabel ? (
              <Badge variant="brand" className="mt-1 w-fit">
                {studentLabel}
              </Badge>
            ) : null}
          </div>
        </div>

        <Separator />

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DetailRow label="Ad" value={data.firstName || "—"} />
          <DetailRow label="Soyad" value={data.lastName || "—"} />
          <DetailRow label="Öğrenim durumu" value={studentLabel ?? "—"} />
        </dl>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "truncate font-mono text-xs" : "truncate text-sm"}>{value}</dd>
    </div>
  );
}

function ProfileOverviewSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-6 w-48" />
      </CardContent>
    </Card>
  );
}
