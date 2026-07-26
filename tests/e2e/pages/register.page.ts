import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** Visible Turkish label of the studentType option to select. */
  studentTypeLabel: string;
  /** Defaults to `password` when omitted. */
  confirmPassword?: string;
}

/** The `/register` screen. */
export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly studentType: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Hesabını oluştur" });
    this.firstName = page.getByLabel("Ad", { exact: true });
    this.lastName = page.getByLabel("Soyad");
    this.email = page.getByLabel("E-posta");
    this.studentType = page.getByLabel("Öğrenim durumu");
    this.password = page.getByLabel("Şifre", { exact: true });
    this.confirmPassword = page.getByLabel("Şifre (tekrar)");
    this.submit = page.getByRole("button", { name: "Hesap oluştur" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/register");
  }

  async fill(data: RegisterFormData): Promise<void> {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.studentType.selectOption({ label: data.studentTypeLabel });
    await this.password.fill(data.password);
    await this.confirmPassword.fill(data.confirmPassword ?? data.password);
  }

  async register(data: RegisterFormData): Promise<void> {
    await this.fill(data);
    await this.submit.click();
  }
}
