import { serverApi } from "@/lib/api/server-api";
import { forward, readJson } from "@/lib/api/route-helpers";
import { resetPasswordSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const { data, error } = await readJson(request, resetPasswordSchema);
  if (error) return error;

  const res = await serverApi("/api/auth/reset-password", { method: "POST", body: data });
  return forward(res);
}
