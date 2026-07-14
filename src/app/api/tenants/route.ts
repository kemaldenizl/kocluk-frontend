import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { createTenantSchema } from "@/features/tenants/schemas";

export async function GET() {
  const res = await callBackendWithAuth("/api/tenants");
  return forward(res);
}

export async function POST(request: Request) {
  const { data, error } = await readJson(request, createTenantSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/tenants", { method: "POST", body: data });
  return forward(res);
}
