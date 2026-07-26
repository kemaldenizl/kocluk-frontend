import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

/** The protected `/profile` (Hesap) screen. */
export class ProfilePage extends BasePage {
  readonly heading: Locator;
  readonly detailsFirstName: Locator;
  readonly detailsLastName: Locator;
  readonly detailsStudentType: Locator;
  readonly saveDetails: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Hesap", exact: true });
    // The editable "Kişisel bilgiler" form fields.
    this.detailsFirstName = page.getByLabel("Ad", { exact: true });
    this.detailsLastName = page.getByLabel("Soyad");
    this.detailsStudentType = page.getByLabel("Öğrenim durumu");
    this.saveDetails = page.getByRole("button", { name: "Değişiklikleri kaydet" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/profile");
  }

  /** The overview card renders the signed-in user's email; a reliable "am I loaded" anchor. */
  email(email: string): Locator {
    return this.page.getByText(email, { exact: true }).first();
  }

  async updateDetails(data: { firstName?: string; lastName?: string; studentTypeLabel?: string }): Promise<void> {
    if (data.firstName !== undefined) await this.detailsFirstName.fill(data.firstName);
    if (data.lastName !== undefined) await this.detailsLastName.fill(data.lastName);
    if (data.studentTypeLabel !== undefined) await this.detailsStudentType.selectOption({ label: data.studentTypeLabel });
    await this.saveDetails.click();
  }
}
