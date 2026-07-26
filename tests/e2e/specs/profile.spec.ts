import { test, expect, TEST_USERS } from "../../common/fixtures";

/** Authenticated profile: identity display, editing, and sign-out. */
test.describe("Profile", () => {
  // Serial: these share the mutable seed student, so order must be deterministic.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ signIn }) => {
    await signIn(TEST_USERS.student);
  });

  test("shows the signed-in user's identity", async ({ profilePage, page }) => {
    await profilePage.goto();

    await expect(profilePage.heading).toBeVisible();
    await expect(profilePage.email(TEST_USERS.student.email)).toBeVisible();
    await expect(page.getByText(TEST_USERS.student.studentTypeLabel).first()).toBeVisible();
  });

  test("prefills the details form from the current user", async ({ profilePage }) => {
    await profilePage.goto();

    await expect(profilePage.detailsFirstName).toHaveValue(TEST_USERS.student.firstName);
    await expect(profilePage.detailsLastName).toHaveValue(TEST_USERS.student.lastName);
  });

  test("saves an updated name and reflects it back", async ({ profilePage }) => {
    await profilePage.goto();
    await expect(profilePage.detailsFirstName).toHaveValue(TEST_USERS.student.firstName);

    await profilePage.updateDetails({ firstName: "Güncel" });

    await expect(profilePage.alert("Bilgilerin güncellendi.")).toBeVisible();
    await expect(profilePage.detailsFirstName).toHaveValue("Güncel");

    // Restore the shared seed so the mutation doesn't leak to re-runs.
    await profilePage.updateDetails({ firstName: TEST_USERS.student.firstName });
    await expect(profilePage.detailsFirstName).toHaveValue(TEST_USERS.student.firstName);
  });

  test("signs out via the account menu and returns to login", async ({ profilePage, page }) => {
    await profilePage.goto();
    await profilePage.logout();

    await expect(page).toHaveURL(/\/login$/);
    // Header reverts to the signed-out state.
    await expect(profilePage.userMenuTrigger).toHaveCount(0);
  });
});
