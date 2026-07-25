import "server-only";

import { serverApi } from "@/lib/api/server-api";
import type { TokenPair } from "./tokens";

interface RefreshResponse {
  tokens: TokenPair;
}

/**
 * Rotates the token pair against the backend. Pure — it performs the network call
 * only and returns the new tokens (or null on failure), leaving cookie persistence
 * to the caller. Shared by the `/api/auth/refresh` route handler and the proxy so
 * the refresh logic lives in exactly one place.
 */
export async function requestBackendRefresh(
  refreshToken: string,
): Promise<TokenPair | null> {
  const res = await serverApi<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });

  if (!res.ok || !res.data?.tokens) return null;
  return res.data.tokens;
}
