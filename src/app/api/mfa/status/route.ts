import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { readMfaEnabled } from "@/lib/auth/mfa-state";
import { problem } from "@/lib/api/route-helpers";
import type { MfaStatus } from "@/features/mfa/types";

/**
 * Reports whether MFA is enabled for the current session, read from the BFF-tracked
 * hint cookie (the backend exposes no status endpoint — see mfa-state.ts). Requires a
 * session so an anonymous caller never gets a misleading `false`.
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return problem(401, "Bu işlem için giriş yapman gerekiyor.", { title: "Yetkisiz" });
  }
  const body: MfaStatus = { enabled: await readMfaEnabled() };
  return NextResponse.json(body, { status: 200 });
}
