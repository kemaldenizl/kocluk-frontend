import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The post-login `/verify-email-required` notice shown for unverified accounts. */
export class VerifyEmailPage extends BasePage {
  readonly heading: Locator;
  readonly notice: Locator;
  readonly resendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Neredeyse hazırsın" });
    this.notice = this.alert("E-posta doğrulaması gerekli");
    this.resendButton = page.getByRole("button", { name: /Doğrulama e-postasını tekrar gönder/ });
  }

  async goto(): Promise<void> {
    await this.page.goto("/verify-email-required");
  }
}
