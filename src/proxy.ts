import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_ROUTES,
  COOKIE_NAMES,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
  ROUTES,
} from "@/config/constants";
import { requestBackendRefresh } from "@/lib/auth/refresh";
import { buildAuthCookies } from "@/lib/auth/tokens";

/**
 * Edge proxy (formerly "middleware" — renamed in Next.js 16).
 *
 * Responsibilities:
 *  - Gate protected pages behind an authenticated session.
 *  - Transparently rotate an expired access token: the access cookie's lifetime is
 *    tied to the token, so once it disappears we mint a fresh pair from the refresh
 *    cookie and let the navigation through — no redirect to login.
 *  - Bounce already-authenticated users away from auth pages (login/register).
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.refreshToken)?.value;

  const isProtected = matches(pathname, PROTECTED_ROUTES);
  const isAuthPage = matches(pathname, AUTH_ROUTES);

  // Already signed in? Keep the user out of login/register.
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.profile, request.url));
  }

  if (!isProtected) {
    return NextResponse.next();
  }

  // Valid-looking access cookie present → let it through (real validity is enforced
  // by the backend on the actual data call).
  if (accessToken) {
    return NextResponse.next();
  }

  // Access cookie expired but a refresh cookie survives → rotate and continue.
  if (refreshToken) {
    const tokens = await requestBackendRefresh(refreshToken);
    if (tokens) {
      const response = NextResponse.next();
      for (const { name, value, options } of buildAuthCookies(tokens)) {
        response.cookies.set(name, value, options);
      }
      return response;
    }
  }

  // No usable session → send to login, remembering where they were headed.
  const loginUrl = new URL(ROUTES.login, request.url);
  loginUrl.searchParams.set(REDIRECT_PARAM, pathname);
  const redirect = NextResponse.redirect(loginUrl);
  redirect.cookies.delete(COOKIE_NAMES.accessToken);
  redirect.cookies.delete(COOKIE_NAMES.refreshToken);
  return redirect;
}

function matches(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Run on all pages except static assets and API routes (handlers manage their own auth). */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)"],
};
