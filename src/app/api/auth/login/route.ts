import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/server-api";
import { readJson, forward } from "@/lib/api/route-helpers";
import { persistSession } from "@/lib/auth/session";
import { loginSchema } from "@/features/auth/schemas";
import type { ClientLoginResult, LoginResult } from "@/features/auth/types";

/**
 * Exchanges credentials for a session. On success the token pair is stored in
 * httpOnly cookies server-side and stripped from the response, so the browser only
 * ever sees the user + MFA state — never the tokens.
 */
export async function POST(request: Request) {
  const { data, error } = await readJson(request, loginSchema);
  if (error) return error;

  const res = await serverApi<LoginResult>("/api/auth/login", { method: "POST", body: data });
  if (!res.ok) return forward(res);

  const { user, tokens, requiresMfa, mfaChallenge } = res.data;
  if (tokens) {
    await persistSession(tokens);
  }

  const body: ClientLoginResult = { user, requiresMfa, mfaChallenge };
  return NextResponse.json(body, { status: 200 });
}
