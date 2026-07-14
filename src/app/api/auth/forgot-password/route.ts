import { serverApi } from "@/lib/api/server-api";
import { forward, readJson } from "@/lib/api/route-helpers";
import { forgotPasswordSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const { data, error } = await readJson(request, forgotPasswordSchema);
  if (error) return error;

  const res = await serverApi("/api/auth/forgot-password", { method: "POST", body: data });
  return forward(res);
}
