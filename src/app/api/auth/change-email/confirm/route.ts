import { serverApi } from "@/lib/api/server-api";
import { forward, readJson } from "@/lib/api/route-helpers";
import { changeEmailConfirmSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const { data, error } = await readJson(request, changeEmailConfirmSchema);
  if (error) return error;

  const res = await serverApi("/api/auth/change-email/confirm", { method: "POST", body: data });
  return forward(res);
}
