import { test, expect, TEST_USERS } from "../../common/fixtures";

/** Forgot-password request flow. */
test.describe("Forgot password", () => {
  test("validates that an email is provided", async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
    await forgotPasswordPage.submit.click();

    await expect(forgotPasswordPage.alert("E-posta gerekli.")).toBeVisible();
  });

  test("shows a success message after requesting a reset link", async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitEmail(TEST_USERS.student.email);

    await expect(forgotPasswordPage.alert("Sıfırlama bağlantısı gönderildi.")).toBeVisible();
  });
});
