import { callBackendWithAuth } from "@/lib/auth/backend-auth";
import { forward } from "@/lib/api/route-helpers";

export async function GET() {
  const res = await callBackendWithAuth("/api/users/me");
  return forward(res);
}
