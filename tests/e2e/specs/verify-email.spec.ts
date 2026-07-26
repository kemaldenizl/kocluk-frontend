import { test, expect, TEST_USERS, makeNewUser } from "../../common/fixtures";

/**
 * Enforcement of email verification: an unverified account cannot authenticate. Login
 * routes it to the notice page (no session), where it can re-send the link. Registration
 * offers the same resend affordance.
 */
test.describe("Email verification gate", () => {
  test("routes an unverified login to the notice page without a session", async ({ loginPage, verifyEmailPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.unverified.email, TEST_USERS.unverified.password);

    await expect(page).toHaveURL(/\/verify-email-required$/);
    await expect(verifyEmailPage.notice).toBeVisible();
    // The email captured at login is echoed back (from sessionStorage, never the URL).
    await expect(verifyEmailPage.notice).toContainText(TEST_USERS.unverified.email);
    // Not authenticated: the header still shows sign-in, not the account menu.
    await expect(verifyEmailPage.userMenuTrigger).toHaveCount(0);
  });

  test("keeps an unverified user out of protected routes", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.unverified.email, TEST_USERS.unverified.password);
    await expect(page).toHaveURL(/\/verify-email-required$/);

    // Cookies were withheld, so the proxy bounces an attempt to reach /profile back to login.
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("resends the verification email from the notice page", async ({ loginPage, verifyEmailPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.unverified.email, TEST_USERS.unverified.password);
    await expect(page).toHaveURL(/\/verify-email-required$/);

    await verifyEmailPage.resendButton.click();
    await expect(verifyEmailPage.alert(/gönderildi|link/i)).toBeVisible();
    // Button enters its cooldown after a successful send.
    await expect(page.getByRole("button", { name: /Tekrar gönder \(\d+ sn\)/ })).toBeVisible();
  });

  test("falls back to the manual resend link when opened directly", async ({ verifyEmailPage, page }) => {
    await verifyEmailPage.goto();

    await expect(verifyEmailPage.notice).toBeVisible();
    await expect(page.getByRole("link", { name: "Doğrulama bağlantısını tekrar gönder" })).toBeVisible();
  });

  test("offers a resend button on the register success screen", async ({ registerPage, page }) => {
    await registerPage.goto();
    await registerPage.register(makeNewUser());

    await expect(registerPage.alert("Hesabın oluşturuldu")).toBeVisible();
    await expect(page.getByRole("button", { name: /Doğrulama e-postasını tekrar gönder/ })).toBeVisible();
  });
});
