import { routeApi } from "@/lib/api/route-api";
import type { UpdateProfileInput } from "./schemas";
import type { CurrentUser } from "./types";

export const profileApi = {
  me: () => routeApi<CurrentUser>("/api/users/me"),

  updateMe: (input: UpdateProfileInput) =>
    routeApi<CurrentUser>("/api/users/me/update", { method: "PUT", body: input }),
};
