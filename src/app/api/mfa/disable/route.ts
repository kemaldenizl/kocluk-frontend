import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { setMfaEnabled } from "@/lib/auth/mfa-state";
import { mfaDisableSchema } from "@/features/mfa/schemas";

/**
 * Turns MFA off after verifying a TOTP or recovery code. On success the BFF clears
 * its MFA-enabled hint so the profile page reflects the new state.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, mfaDisableSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/mfa/disable", { method: "POST", body: data });
  if (res.ok) await setMfaEnabled(false);
  return forward(res);
}
