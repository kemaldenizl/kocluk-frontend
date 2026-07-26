import { test, expect } from "../../common/fixtures";

/** The one-tap light/dark theme toggle in the header. */
test.describe("Theme toggle", () => {
  test("flips the document theme class and back", async ({ homePage, page }) => {
    await homePage.goto();
    // next-themes resolves the OS preference; Playwright defaults to light.
    await expect(page.locator("html")).toHaveClass(/light/);

    await homePage.toggleTheme();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await homePage.toggleTheme();
    await expect(page.locator("html")).toHaveClass(/light/);
  });
});
