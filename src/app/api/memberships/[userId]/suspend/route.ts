import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, forwardQuery } from "@/lib/api/route-helpers";

type Context = { params: Promise<{ userId: string }> };

export async function POST(request: Request, { params }: Context) {
  const { userId } = await params;
  const res = await callBackendWithAuth(`/api/memberships/${userId}/suspend${forwardQuery(request, ["tenantId"])}`, {
    method: "POST",
  });
  return forward(res);
}
