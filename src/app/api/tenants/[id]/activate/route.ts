import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward } from "@/lib/api/route-helpers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await callBackendWithAuth(`/api/tenants/${id}/activate`, { method: "POST" });
  return forward(res);
}
