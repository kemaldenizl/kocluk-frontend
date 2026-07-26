import { test, expect, TEST_USERS } from "../../common/fixtures";

/** The full login flow: client validation, backend errors, success, and guarding. */
test.describe("Login", () => {
  test("shows client-side validation errors on empty submit", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.submit.click();

    await expect(loginPage.alert("E-posta gerekli.")).toBeVisible();
    await expect(loginPage.alert("Şifre gerekli.")).toBeVisible();
    // Never left the page.
    await expect(page).toHaveURL(/\/login$/);
  });

  test("surfaces the backend error for wrong credentials and stays on the page", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.student.email, "wrong-password-1");

    await expect(loginPage.alert("E-posta veya şifre hatalı.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs in with valid credentials and lands on the profile", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

    await expect(page).toHaveURL(/\/profile$/);
    // The auth-aware header now shows the account menu instead of sign-in links.
    await expect(loginPage.userMenuTrigger).toBeVisible();
  });

  test("honours the ?from redirect target after login", async ({ loginPage, page }) => {
    await loginPage.goto("/admin");
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

    await expect(page).toHaveURL(/\/admin$/);
  });

  test("redirects an already-authenticated user away from /login", async ({ signIn, page }) => {
    await signIn(TEST_USERS.student);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("toggles password visibility", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.password.fill("secret12345");
    await expect(loginPage.password).toHaveAttribute("type", "password");

    await loginPage.page.getByRole("button", { name: "Şifreyi göster" }).click();
    await expect(loginPage.password).toHaveAttribute("type", "text");
  });
});
