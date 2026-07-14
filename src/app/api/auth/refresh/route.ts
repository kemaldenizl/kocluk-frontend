import { NextResponse } from "next/server";
import { getRefreshToken, persistSession, clearSession } from "@/lib/auth/session";
import { requestBackendRefresh } from "@/lib/auth/refresh";
import { problem } from "@/lib/api/route-helpers";

/**
 * Rotates the session using the httpOnly refresh cookie. The refresh token is never
 * accepted from the request body — only from the secure cookie — so it cannot leak
 * through the browser.
 */
export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return problem(401, "Aktif oturum yok.", { title: "Yetkisiz" });
  }

  const tokens = await requestBackendRefresh(refreshToken);
  if (!tokens) {
    await clearSession();
    return problem(401, "Oturumun süresi doldu. Lütfen tekrar giriş yap.", { title: "Yetkisiz" });
  }

  await persistSession(tokens);
  return new NextResponse(null, { status: 204 });
}
