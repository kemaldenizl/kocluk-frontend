import { serverApi } from "@/lib/api/server-api";
import { forward, problem } from "@/lib/api/route-helpers";

/** Public token check: GET /api/auth/change-email/validate?token=... */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return problem(400, "Token parametresi gerekli.", { title: "Geçersiz istek" });
  }

  const res = await serverApi(`/api/auth/change-email/validate?token=${encodeURIComponent(token)}`);
  return forward(res);
}
