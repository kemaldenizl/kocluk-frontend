import "server-only";

import { serverApi, type ServerApiOptions } from "@/lib/api/server-api";
import type { BackendResponse } from "@/lib/api/types";
import { getAccessToken, getRefreshToken, persistSession, clearSession } from "./session";
import { requestBackendRefresh } from "./refresh";

/**
 * Calls a protected backend endpoint on behalf of the current session.
 *
 * Reads the access token from cookies, and on a `401` transparently attempts a
 * refresh (rotating + persisting new cookies) and retries the request once. If the
 * refresh fails the session is cleared. Authenticated route handlers use this so
 * token renewal lives in one place rather than being duplicated per endpoint.
 */
export async function callBackendWithAuth<T = unknown>(
  path: string,
  options: Omit<ServerApiOptions, "accessToken"> = {},
): Promise<BackendResponse<T>> {
  const accessToken = await getAccessToken();
  const first = await serverApi<T>(path, { ...options, accessToken });

  if (first.status !== 401) {
    return first;
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return first;
  }

  const tokens = await requestBackendRefresh(refreshToken);
  if (!tokens) {
    await clearSession();
    return first;
  }

  await persistSession(tokens);
  return serverApi<T>(path, { ...options, accessToken: tokens.accessToken });
}
