import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { changeEmailRequestSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const { data, error } = await readJson(request, changeEmailRequestSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/auth/change-email/request", { method: "POST", body: data });
  return forward(res);
}
