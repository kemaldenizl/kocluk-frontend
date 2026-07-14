import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward, readJson } from "@/lib/api/route-helpers";
import { createPermissionSchema } from "@/features/permissions/schemas";

export async function GET() {
  const res = await callBackendWithAuth("/api/permissions");
  return forward(res);
}

export async function POST(request: Request) {
  const { data, error } = await readJson(request, createPermissionSchema);
  if (error) return error;

  const res = await callBackendWithAuth("/api/permissions", { method: "POST", body: data });
  return forward(res);
}
