import { NextResponse } from "next/server";
import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { clearSession } from "@/lib/auth/session";

/**
 * Revokes every session of the current user server-side, then clears the local
 * cookies regardless of the backend outcome — mirrors the single-session logout
 * route so the caller is never left "stuck" logged in on this device.
 */
export async function POST() {
  await callBackendWithAuth("/api/auth/logout-all", { method: "POST" });
  await clearSession();
  return new NextResponse(null, { status: 204 });
}
