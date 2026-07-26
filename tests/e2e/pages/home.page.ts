import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The public landing page. */
export class HomePage extends BasePage {
  readonly heading: Locator;
  readonly startCta: Locator;
  readonly loginCta: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /Hedefe giden yolda/ });
    this.startCta = page.getByRole("link", { name: /Hemen başla/ });
    this.loginCta = page.getByRole("main").getByRole("link", { name: "Giriş yap" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
