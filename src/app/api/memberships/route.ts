import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, forwardQuery, readJson } from "@/lib/api/route-helpers";
import { addMemberSchema } from "@/features/members/schemas";

export async function GET(request: Request) {
  const res = await callBackendWithAuth(`/api/memberships${forwardQuery(request, ["tenantId"])}`);
  return forward(res);
}

export async function POST(request: Request) {
  const { data, error } = await readJson(request, addMemberSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/memberships", { method: "POST", body: data });
  return forward(res);
}
