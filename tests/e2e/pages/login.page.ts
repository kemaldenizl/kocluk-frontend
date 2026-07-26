import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The `/login` screen. */
export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly forgotLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Tekrar hoş geldin" });
    this.email = page.getByLabel("E-posta");
    this.password = page.getByLabel("Şifre", { exact: true });
    this.submit = page.getByRole("button", { name: "Giriş yap" });
    this.forgotLink = page.getByRole("link", { name: "Şifreni mi unuttun?" });
    this.registerLink = page.getByRole("link", { name: "Kayıt ol" });
  }

  async goto(from?: string): Promise<void> {
    await this.page.goto(from ? `/login?from=${encodeURIComponent(from)}` : "/login");
  }

  async fill(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(email, password);
    await this.submit.click();
  }
}
