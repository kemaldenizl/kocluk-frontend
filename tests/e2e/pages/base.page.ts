import { type Locator, type Page } from "@playwright/test";

/**
 * Shared base for every page object. Owns the auth-aware header (banner) controls so
 * specs never re-derive header selectors — the single place that knows how to open
 * the account menu, sign out, or flip the theme.
 */
export class BasePage {
  readonly page: Page;
  readonly banner: Locator;
  readonly themeToggle: Locator;
  readonly userMenuTrigger: Locator;
  readonly headerSignInLink: Locator;
  readonly headerRegisterLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.getByRole("banner");
    this.themeToggle = this.banner.getByRole("button", { name: "Temayı değiştir" });
    this.userMenuTrigger = this.banner.getByRole("button", { name: "Hesap menüsü" });
    this.headerSignInLink = this.banner.getByRole("link", { name: "Giriş yap" });
    this.headerRegisterLink = this.banner.getByRole("link", { name: "Kayıt ol" });
  }

  /** A `role="alert"` banner containing the given text (form or field error/success). */
  alert(text: string | RegExp): Locator {
    return this.page.getByRole("alert").filter({ hasText: text });
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuTrigger.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole("menuitem", { name: "Çıkış yap" }).click();
  }

  async gotoAdminViaMenu(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole("menuitem", { name: "Yönetim" }).click();
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  /** The `class` attribute of `<html>` — next-themes writes `dark` / `light` here. */
  htmlClass(): Promise<string | null> {
    return this.page.locator("html").getAttribute("class");
  }
}
