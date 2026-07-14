import { routeApi } from "@/lib/api/route-api";
import type { SessionResponse } from "./types";

/** Client-side sessions API for the current user's own sessions. */
export const sessionsApi = {
  list: () => routeApi<SessionResponse[]>("/api/sessions"),

  revoke: (id: string) => routeApi<null>(`/api/sessions/${id}`, { method: "DELETE" }),
};
