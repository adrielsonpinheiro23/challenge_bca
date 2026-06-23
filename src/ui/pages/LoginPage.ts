import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly errorAlert: Locator;
  private readonly loginButton: Locator;
  private readonly loginTitle: Locator;
  private readonly passwordInput: Locator;
  private readonly requiredMessages: Locator;
  private readonly usernameInput: Locator;

  constructor(private readonly page: Page) {
    this.errorAlert = page.locator('.oxd-alert-content');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.loginTitle = page.locator('.orangehrm-login-title');
    this.passwordInput = page.locator('input[name="password"]');
    this.requiredMessages = page.locator('.oxd-input-field-error-message');
    this.usernameInput = page.locator('input[name="username"]');
  }

  async goto() {
    // The public demo can keep background requests open, especially outside Chromium.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(this.loginTitle).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.scrollIntoViewIfNeeded();
    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => undefined);
  }

  async submitEmptyForm() {
    await this.loginButton.scrollIntoViewIfNeeded();
    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }

  async expectLoginPageVisible() {
    await expect(this.loginTitle).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectInvalidCredentialsMessage() {
    await expect(this.errorAlert).toContainText('Invalid credentials');
  }

  async expectRequiredMessages(count = 2) {
    await expect(this.requiredMessages).toHaveCount(count);
  }
}
