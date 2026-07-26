import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/server-api";
import { readJson, forward } from "@/lib/api/route-helpers";
import { persistSession } from "@/lib/auth/session";
import { setMfaEnabled } from "@/lib/auth/mfa-state";
import { mfaLoginCompleteSchema } from "@/features/mfa/schemas";
import type { ClientLoginResult, LoginResult } from "@/features/auth/types";

/**
 * Completes an MFA login challenge. Mirrors the login route: on success the token
 * pair is stored in httpOnly cookies server-side and stripped from the response, so
 * the browser only ever sees the user — never the tokens.
 *
 * Email verification is enforced here as in login: an unverified account never
 * receives a session even if the backend issued tokens, and the client is told to
 * route to verification. A completed challenge means MFA is on, so the hint is set.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, mfaLoginCompleteSchema);
  if (error) return error;

  const res = await serverApi<LoginResult>("/api/mfa/login/complete", { method: "POST", body: data });
  if (!res.ok) return forward(res);

  const { user, tokens, requiresMfa, mfaChallenge } = res.data;
  const requiresEmailVerification = !user.emailVerified;

  if (tokens && !requiresEmailVerification) {
    await persistSession(tokens);
    await setMfaEnabled(true);
  }

  const body: ClientLoginResult = { user, requiresMfa, mfaChallenge, requiresEmailVerification };
  return NextResponse.json(body, { status: 200 });
}
