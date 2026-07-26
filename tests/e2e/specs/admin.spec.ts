import { test, expect, TEST_USERS } from "../../common/fixtures";

/** Admin console access control and navigation. */
test.describe("Admin console", () => {
  test("denies a non-admin with a 403 empty state", async ({ signIn, adminPage }) => {
    await signIn(TEST_USERS.student);
    await adminPage.goto();

    await expect(adminPage.forbidden).toBeVisible();
    await expect(adminPage.tablist).toHaveCount(0);
    await expect(adminPage.backToProfile).toBeVisible();
  });

  test("does not offer the admin menu entry to a non-admin", async ({ signIn, page, profilePage }) => {
    await signIn(TEST_USERS.student);
    await page.goto("/profile");
    await profilePage.openUserMenu();

    await expect(page.getByRole("menuitem", { name: "Profil" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Yönetim" })).toHaveCount(0);
  });

  test("grants an admin access to all management tabs", async ({ signIn, adminPage }) => {
    await signIn(TEST_USERS.admin);
    await adminPage.goto();

    await expect(adminPage.heading).toBeVisible();
    await expect(adminPage.tab("Kiracılar")).toBeVisible();
    await expect(adminPage.tab("Üyeler")).toBeVisible();
    await expect(adminPage.tab("Roller")).toBeVisible();
    await expect(adminPage.tab("İzinler")).toBeVisible();
  });

  test("switches between management tabs", async ({ signIn, adminPage }) => {
    await signIn(TEST_USERS.admin);
    await adminPage.goto();

    // Tenants is selected by default.
    await expect(adminPage.tab("Kiracılar")).toHaveAttribute("aria-selected", "true");

    await adminPage.selectTab("Roller");
    await expect(adminPage.tab("Roller")).toHaveAttribute("aria-selected", "true");
    await expect(adminPage.tab("Kiracılar")).toHaveAttribute("aria-selected", "false");
  });

  test("reaches the admin console through the account menu", async ({ signIn, page, adminPage }) => {
    await signIn(TEST_USERS.admin);
    await page.goto("/profile");
    await adminPage.gotoAdminViaMenu();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(adminPage.heading).toBeVisible();
  });
});
