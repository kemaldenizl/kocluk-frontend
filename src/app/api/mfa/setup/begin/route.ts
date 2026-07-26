import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward } from "@/lib/api/route-helpers";
import type { MfaSetupBeginResult } from "@/features/mfa/types";

/**
 * Starts authenticator-app enrolment. No request body; the backend returns the
 * `otpauth` URI (rendered as a QR code) and a manual entry key. MFA is not yet active
 * — it turns on only once `setup/complete` succeeds.
 */
export async function POST() {
  const res = await callBackendWithAuth<MfaSetupBeginResult>("/api/mfa/setup/begin", { method: "POST" });
  return forward(res);
}
