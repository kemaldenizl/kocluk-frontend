import { test, expect, TEST_USERS } from "../../common/fixtures";

/** The proxy gate: unauthenticated access to protected pages redirects to login. */
test.describe("Protected route guarding", () => {
  test("redirects anonymous users from /profile to /login with a from param", async ({ page, loginPage }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/login\?from=%2Fprofile/);
    await expect(loginPage.heading).toBeVisible();
  });

  test("redirects anonymous users from /admin to /login with a from param", async ({ page, loginPage }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login\?from=%2Fadmin/);
    await expect(loginPage.heading).toBeVisible();
  });

  test("lets a signed-in user reach the profile directly", async ({ signIn, page, profilePage }) => {
    await signIn(TEST_USERS.student);
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/profile$/);
    await expect(profilePage.heading).toBeVisible();
  });
});
