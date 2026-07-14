import { serverApi } from "@/lib/api/server-api";
import { forward, readJson } from "@/lib/api/route-helpers";
import { verifyEmailSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const { data, error } = await readJson(request, verifyEmailSchema);
  if (error) return error;

  const res = await serverApi("/api/auth/verify-email", { method: "POST", body: data });
  return forward(res);
}
