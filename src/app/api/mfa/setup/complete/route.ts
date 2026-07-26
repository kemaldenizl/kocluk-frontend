import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { setMfaEnabled } from "@/lib/auth/mfa-state";
import { mfaSetupCompleteSchema } from "@/features/mfa/schemas";
import type { RecoveryCodesResult } from "@/features/mfa/types";

/**
 * Confirms enrolment with a code from the authenticator app and returns one-time
 * recovery codes. On success the BFF flips its MFA-enabled hint so the profile page
 * reflects the new state without another round-trip.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, mfaSetupCompleteSchema);
  if (error) return error;

  const res = await callBackendWithAuth<RecoveryCodesResult>("/api/mfa/setup/complete", {
    method: "POST",
    body: data,
  });
  if (res.ok) await setMfaEnabled(true);
  return forward(res);
}
