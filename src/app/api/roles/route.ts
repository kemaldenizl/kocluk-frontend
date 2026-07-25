import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, forwardQuery, readJson } from "@/lib/api/route-helpers";
import { createRoleSchema } from "@/features/roles/schemas";

export async function GET(request: Request) {
  const res = await callBackendWithAuth(`/api/roles${forwardQuery(request, ["tenantId"])}`);
  return forward(res);
}

export async function POST(request: Request) {
  const { data, error } = await readJson(request, createRoleSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/roles", { method: "POST", body: data });
  return forward(res);
}
