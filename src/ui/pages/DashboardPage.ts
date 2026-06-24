import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
  private readonly adminMenu: Locator;
  private readonly header: Locator;
  private readonly logoutLink: Locator;
  private readonly pimMenu: Locator;
  private readonly userMenu: Locator;

  constructor(private readonly page: Page) {
    this.adminMenu = page.locator('a[href="/web/index.php/admin/viewAdminModule"]');
    this.header = page.locator('.oxd-topbar-header-breadcrumb h6');
    this.logoutLink = page.locator('a[href*="/auth/logout"]');
    this.pimMenu = page.locator('a[href="/web/index.php/pim/viewPimModule"]');
    this.userMenu = page.locator('.oxd-userdropdown-tab');
  }

  async expectLoaded() {
    await this.page.waitForURL(/\/dashboard\/index/, {
      timeout: 45_000,
      waitUntil: 'domcontentloaded',
    });
    await expect(this.header).toHaveText('Dashboard', { timeout: 30_000 });
    await expect(this.page.getByText('Time at Work')).toBeVisible();
    await expect(this.page.getByText('My Actions')).toBeVisible();
    await expect(this.page.getByText('Quick Launch')).toBeVisible();
  }

  async logout() {
    await this.userMenu.click();
    await expect(this.logoutLink).toBeVisible();
    await this.logoutLink.click();
  }

  async goToPim() {
    await expect(this.pimMenu).toBeVisible();
    await this.pimMenu.click();
    await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/, { timeout: 30_000 });
    await expect(this.page.getByRole('heading', { name: /^PIM$/i })).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectSidebarNavigation() {
    await expect(this.adminMenu).toBeVisible();
    await this.adminMenu.click();
    await expect(this.page).toHaveURL(/\/admin\/viewSystemUsers/);

    await this.pimMenu.click();
    await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/);
  }
}
