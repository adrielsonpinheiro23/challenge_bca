import { expect, Locator, Page } from '@playwright/test';

export class PimPage {
  private readonly addButton: Locator;
  private readonly employeeNameInput: Locator;
  private readonly employeeTable: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly recordsText: Locator;
  private readonly saveButton: Locator;
  private readonly searchButton: Locator;

  constructor(private readonly page: Page) {
    this.addButton = page.locator('button[type="button"]:has-text("Add")');
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.employeeTable = page.locator('div[role="table"].orangehrm-employee-list');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.recordsText = page.locator('.orangehrm-horizontal-padding .oxd-text').first();
    this.saveButton = page.locator('button[type="submit"]:has-text("Save")');
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
  }

  async expectEmployeeListVisible() {
    await expect(this.page.getByRole('heading', { name: 'PIM' })).toBeVisible();
    await expect(this.employeeTable).toBeVisible();
    await expect(this.recordsText).toBeVisible();
  }

  async expectNoRecordsFound() {
    await expect(this.recordsText).toContainText('No Records Found');
  }

  async searchEmployee(name: string) {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
    await expect(this.recordsText).toBeVisible();
  }

  async expectSearchCompleted() {
    await expect(this.recordsText).toContainText(/Record|Records|No Records Found/);
  }

  async addEmployee(firstName: string, lastName: string) {
    await this.addButton.click();
    await expect(this.page.getByRole('heading', { name: /^Add Employee$/i })).toBeVisible({ timeout: 30_000 });
    await expect(this.firstNameInput).toBeVisible({ timeout: 30_000 });
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await expect(this.saveButton).toBeVisible({ timeout: 30_000 });
    await this.saveButton.click();
  }

  async expectPersonalDetails(firstName: string, lastName: string) {
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    await expect(this.firstNameInput).toHaveValue(firstName);
    await expect(this.lastNameInput).toHaveValue(lastName);
  }
}
