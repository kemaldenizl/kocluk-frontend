import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { createRoleSchema } from "@/features/roles/schemas";

export async function GET() {
  const res = await callBackendWithAuth("/api/roles");
  return forward(res);
}

export async function POST(request: Request) {
  const { data, error } = await readJson(request, createRoleSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/roles", { method: "POST", body: data });
  return forward(res);
}
