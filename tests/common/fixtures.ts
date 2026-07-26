import { test as base, expect, type APIResponse } from "@playwright/test";
import { HomePage } from "../e2e/pages/home.page";
import { LoginPage } from "../e2e/pages/login.page";
import { RegisterPage } from "../e2e/pages/register.page";
import { ForgotPasswordPage } from "../e2e/pages/forgot-password.page";
import { ProfilePage } from "../e2e/pages/profile.page";
import { AdminPage } from "../e2e/pages/admin.page";
import type { TestUser } from "./users";

/**
 * Central E2E fixtures. Every page object is injected per test (constructed with the
 * test's `page`), and `signIn` performs a fast, programmatic login through the app's
 * own login route so authenticated specs don't pay the cost of the UI flow. Specs
 * import `test` / `expect` from here instead of `@playwright/test` directly — one
 * place wires the whole harness together (DRY).
 */

interface Pages {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
  profilePage: ProfilePage;
  adminPage: AdminPage;
}

interface Helpers {
  /**
   * Logs the browser context in via `POST /api/auth/login` (same cookie jar as the
   * page), so httpOnly session cookies are set without driving the UI. Returns the
   * raw response for the rare case a spec wants to assert on it.
   */
  signIn: (user: TestUser) => Promise<APIResponse>;
}

export const test = base.extend<Pages & Helpers>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  signIn: async ({ page }, use) => {
    await use(async (user: TestUser) => {
      const response = await page.request.post("/api/auth/login", {
        data: { email: user.email, password: user.password },
      });
      expect(response.ok(), `programmatic login should succeed for ${user.email}`).toBeTruthy();
      return response;
    });
  },
});

export { expect };
export { TEST_USERS, makeNewUser, VALID_PASSWORD } from "./users";
export type { TestUser } from "./users";
