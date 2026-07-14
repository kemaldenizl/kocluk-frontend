import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { updateProfileSchema } from "@/features/profile/schemas";

export async function PUT(request: Request) {
  const { data, error } = await readJson(request, updateProfileSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/users/me/update", { method: "PUT", body: data });
  return forward(res);
}
