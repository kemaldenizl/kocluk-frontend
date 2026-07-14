import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { addRolePermissionSchema } from "@/features/roles/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await readJson(request, addRolePermissionSchema);
  if (error) return error;

  const res = await callBackendWithAuth(`/api/roles/${id}/permissions`, { method: "POST", body: data });
  return forward(res);
}
