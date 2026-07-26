import { describe, expect, it } from "vitest";
import {
  AUTH_ROUTES,
  COOKIE_NAMES,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
  ROUTES,
} from "@/config/constants";

/** Unit tests pinning the framework-agnostic route/cookie constants the proxy relies on. */

describe("cookie names", () => {
  it("uses the httpOnly session cookie names the backend/proxy expect", () => {
    expect(COOKIE_NAMES.accessToken).toBe("access_token");
    expect(COOKIE_NAMES.refreshToken).toBe("refresh_token");
  });
});

describe("routes", () => {
  it("exposes the core page paths", () => {
    expect(ROUTES.login).toBe("/login");
    expect(ROUTES.profile).toBe("/profile");
    expect(ROUTES.admin).toBe("/admin");
    expect(ROUTES.changeEmail).toBe("/change-email");
    expect(ROUTES.changePassword).toBe("/change-password");
  });

  it("guards profile and admin as protected routes", () => {
    expect(PROTECTED_ROUTES).toContain(ROUTES.profile);
    expect(PROTECTED_ROUTES).toContain(ROUTES.admin);
  });

  it("marks login and register as auth routes to bounce signed-in users from", () => {
    expect(AUTH_ROUTES).toContain(ROUTES.login);
    expect(AUTH_ROUTES).toContain(ROUTES.register);
  });

  it("does not treat auth pages as protected (avoids a redirect loop)", () => {
    for (const route of AUTH_ROUTES) {
      expect(PROTECTED_ROUTES).not.toContain(route);
    }
  });

  it("uses 'from' as the post-login redirect param", () => {
    expect(REDIRECT_PARAM).toBe("from");
  });
});
