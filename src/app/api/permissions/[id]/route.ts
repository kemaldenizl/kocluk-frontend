import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward } from "@/lib/api/route-helpers";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await callBackendWithAuth(`/api/permissions/${id}`, { method: "DELETE" });
  return forward(res);
}
