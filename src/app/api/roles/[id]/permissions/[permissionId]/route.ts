import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward } from "@/lib/api/route-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; permissionId: string }> },
) {
  const { id, permissionId } = await params;
  const res = await callBackendWithAuth(`/api/roles/${id}/permissions/${permissionId}`, { method: "DELETE" });
  return forward(res);
}
