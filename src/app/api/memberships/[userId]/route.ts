import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, forwardQuery } from "@/lib/api/route-helpers";

type Context = { params: Promise<{ userId: string }> };

export async function DELETE(request: Request, { params }: Context) {
  const { userId } = await params;
  const res = await callBackendWithAuth(`/api/memberships/${userId}${forwardQuery(request, ["tenantId"])}`, {
    method: "DELETE",
  });
  return forward(res);
}
