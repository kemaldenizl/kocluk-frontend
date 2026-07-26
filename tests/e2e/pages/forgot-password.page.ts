import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The `/forgot-password` screen. */
export class ForgotPasswordPage extends BasePage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Şifreni sıfırla" });
    this.email = page.getByLabel("E-posta");
    this.submit = page.getByRole("button", { name: "Sıfırlama bağlantısı gönder" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/forgot-password");
  }

  async submitEmail(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submit.click();
  }
}
