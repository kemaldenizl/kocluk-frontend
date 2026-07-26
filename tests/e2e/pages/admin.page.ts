import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The protected `/admin` (Yönetim) console. */
export class AdminPage extends BasePage {
  readonly heading: Locator;
  readonly tablist: Locator;
  readonly forbidden: Locator;
  readonly backToProfile: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Yönetim", exact: true });
    this.tablist = page.getByRole("tablist", { name: "Yönetim alanları" });
    // Rendered by the layout's 403 EmptyState for non-admins.
    this.forbidden = page.getByRole("heading", { name: "Bu alana erişimin yok" });
    this.backToProfile = page.getByRole("link", { name: "Hesabıma dön" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin");
  }

  tab(name: "Kiracılar" | "Üyeler" | "Roller" | "İzinler"): Locator {
    return this.tablist.getByRole("tab", { name });
  }

  async selectTab(name: "Kiracılar" | "Üyeler" | "Roller" | "İzinler"): Promise<void> {
    await this.tab(name).click();
  }
}
