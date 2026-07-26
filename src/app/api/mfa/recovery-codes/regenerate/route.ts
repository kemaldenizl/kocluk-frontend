import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { mfaRegenerateRecoveryCodesSchema } from "@/features/mfa/schemas";
import type { RecoveryCodesResult } from "@/features/mfa/types";

/**
 * Regenerates recovery codes after confirming with a TOTP code. Invalidates the
 * previous set; the response carries the fresh codes to show once.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, mfaRegenerateRecoveryCodesSchema);
  if (error) return error;

  const res = await callBackendWithAuth<RecoveryCodesResult>("/api/mfa/recovery-codes/regenerate", {
    method: "POST",
    body: data,
  });
  return forward(res);
}
