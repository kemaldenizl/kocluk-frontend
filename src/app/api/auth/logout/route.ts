import { NextResponse } from "next/server";
import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { clearSession } from "@/lib/auth/session";

/**
 * Revokes the current session server-side, then clears the local cookies regardless
 * of the backend outcome (a failed revoke should never leave the user "stuck" logged in).
 */
export async function POST() {
  await callBackendWithAuth("/api/auth/logout", { method: "POST" });
  await clearSession();
  return new NextResponse(null, { status: 204 });
}
