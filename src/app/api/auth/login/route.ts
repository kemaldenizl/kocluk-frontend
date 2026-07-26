import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/server-api";
import { readJson, forward } from "@/lib/api/route-helpers";
import { persistSession } from "@/lib/auth/session";
import { setMfaEnabled } from "@/lib/auth/mfa-state";
import { loginSchema } from "@/features/auth/schemas";
import type { ClientLoginResult, LoginResult } from "@/features/auth/types";

/**
 * Exchanges credentials for a session. On success the token pair is stored in
 * httpOnly cookies server-side and stripped from the response, so the browser only
 * ever sees the user + MFA state — never the tokens.
 *
 * Email verification is enforced here: an account whose email is unverified never
 * receives a session (cookies are withheld even if the backend issued tokens). The
 * client is told via `requiresEmailVerification` to route the user to verification.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, loginSchema);
  if (error) return error;

  const res = await serverApi<LoginResult>("/api/auth/login", { method: "POST", body: data });
  if (!res.ok) return forward(res);

  const { user, tokens, requiresMfa, mfaChallenge } = res.data;
  const requiresEmailVerification = !user.emailVerified;

  if (tokens && !requiresEmailVerification) {
    await persistSession(tokens);
    // A session issued without an MFA challenge means MFA is off for this account.
    await setMfaEnabled(false);
  }

  const body: ClientLoginResult = { user, requiresMfa, mfaChallenge, requiresEmailVerification };
  return NextResponse.json(body, { status: 200 });
}
