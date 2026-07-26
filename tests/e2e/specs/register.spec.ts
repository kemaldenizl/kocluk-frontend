import { test, expect, TEST_USERS, makeNewUser } from "../../common/fixtures";

/** Registration: field validation branches, success, and the duplicate-email path. */
test.describe("Register", () => {
  test("rejects mismatched passwords", async ({ registerPage }) => {
    const user = makeNewUser();
    await registerPage.goto();
    await registerPage.register({ ...user, confirmPassword: "Different12345" });

    await expect(registerPage.alert("Şifreler eşleşmiyor.")).toBeVisible();
  });

  test("rejects a password shorter than 12 characters", async ({ registerPage }) => {
    const user = makeNewUser({ password: "short" });
    await registerPage.goto();
    await registerPage.register(user);

    await expect(registerPage.alert("Şifre en az 12 karakter olmalı.")).toBeVisible();
  });

  test("requires a student type to be chosen", async ({ registerPage }) => {
    const user = makeNewUser();
    await registerPage.goto();
    // Fill everything except the studentType select.
    await registerPage.firstName.fill(user.firstName);
    await registerPage.lastName.fill(user.lastName);
    await registerPage.email.fill(user.email);
    await registerPage.password.fill(user.password);
    await registerPage.confirmPassword.fill(user.password);
    await registerPage.submit.click();

    await expect(registerPage.alert("Öğrenim durumunu seç.")).toBeVisible();
  });

  test("registers a new account and shows the verification notice", async ({ registerPage }) => {
    const user = makeNewUser();
    await registerPage.goto();
    await registerPage.register(user);

    await expect(registerPage.alert("Hesabın oluşturuldu")).toBeVisible();
    await expect(registerPage.page.getByText(user.email)).toBeVisible();
  });

  test("surfaces a duplicate-email error from the backend", async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register({
      firstName: "Tekrar",
      lastName: "Deneme",
      email: TEST_USERS.student.email,
      password: TEST_USERS.student.password,
      studentTypeLabel: "Lise",
    });

    await expect(registerPage.alert("Bu e-posta ile bir hesap zaten var.")).toBeVisible();
  });
});
