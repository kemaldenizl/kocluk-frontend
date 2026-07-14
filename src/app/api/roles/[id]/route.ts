import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { updateRoleSchema } from "@/features/roles/schemas";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const res = await callBackendWithAuth(`/api/roles/${id}`);
  return forward(res);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const { data, error } = await readJson(request, updateRoleSchema);
  if (error) return error;

  const res = await callBackendWithAuth(`/api/roles/${id}`, { method: "PUT", body: data });
  return forward(res);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const res = await callBackendWithAuth(`/api/roles/${id}`, { method: "DELETE" });
  return forward(res);
}
