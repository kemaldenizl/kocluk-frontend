import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, forwardQuery, readJson } from "@/lib/api/route-helpers";
import { grantMemberRoleSchema } from "@/features/members/schemas";

type Context = { params: Promise<{ userId: string }> };

export async function POST(request: Request, { params }: Context) {
  const { userId } = await params;
  const { data, error } = await readJson(request, grantMemberRoleSchema);
  if (error) return error;

  const res = await callBackendWithAuth(`/api/memberships/${userId}/roles${forwardQuery(request, ["tenantId"])}`, {
    method: "POST",
    body: data,
  });
  return forward(res);
}
