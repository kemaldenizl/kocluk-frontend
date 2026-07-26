import { test, expect } from "../../common/fixtures";

/** Landing page: content, calls-to-action, and the unauthenticated header state. */
test.describe("Home page", () => {
  test("renders the hero and feature sections", async ({ homePage, page }) => {
    await homePage.goto();

    await expect(homePage.heading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Neler sunuyoruz?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Net Analizi" })).toBeVisible();
  });

  test("shows sign-in and register actions in the header when signed out", async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.headerRegisterLink).toBeVisible();
    await expect(homePage.userMenuTrigger).toHaveCount(0);
  });

  test("the primary CTA navigates to register", async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.startCta.click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("the secondary CTA navigates to login", async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.loginCta.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
