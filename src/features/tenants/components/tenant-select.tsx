"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error-message";
import type { TenantResponse } from "../types";

type TenantSelectProps = {
  tenants: UseQueryResult<TenantResponse[]>;
  value: string;
  onChange: (tenantId: string) => void;
  label?: string;
};

/**
 * Tenant picker shared by every tenant-scoped panel. Pairs with {@link useTenantScope},
 * which owns the selection state and default. Renders the list's loading/error/empty
 * states inline so callers don't repeat them.
 */
export function TenantSelect({ tenants, value, onChange, label = "Kiracı" }: TenantSelectProps) {
  if (tenants.isPending) return <Skeleton className="h-9 w-full max-w-xs" />;

  if (tenants.isError) {
    return (
      <Alert variant="error" title="Kiracılar yüklenemedi">
        {getErrorMessage(tenants.error)}
      </Alert>
    );
  }

  if (tenants.data.length === 0) {
    return (
      <Alert variant="warning" title="Kiracı yok">
        Önce Kiracılar sekmesinden bir kiracı oluştur.
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <SelectField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={tenants.data.map((t) => ({
          value: t.id,
          label: t.isActive ? t.name : `${t.name} (Pasif)`,
        }))}
      />
    </div>
  );
}
