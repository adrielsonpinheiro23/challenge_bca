import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
  private readonly adminMenu: Locator;
  private readonly header: Locator;
  private readonly logoutLink: Locator;
  private readonly pimMenu: Locator;
  private readonly userMenu: Locator;

  constructor(private readonly page: Page) {
    this.adminMenu = page.locator('a[href="/web/index.php/admin/viewAdminModule"]');
    this.header = page.getByRole('heading', { name: /Dashboard|PIM/ });
    this.logoutLink = page.locator('a[href*="/auth/logout"]');
    this.pimMenu = page.locator('a[href="/web/index.php/pim/viewPimModule"]');
    this.userMenu = page.locator('.oxd-userdropdown-tab');
  }

  async expectLoaded() {
    await expect(this.header).toHaveText('Dashboard');
    await expect(this.page.getByText('Time at Work')).toBeVisible();
    await expect(this.page.getByText('My Actions')).toBeVisible();
    await expect(this.page.getByText('Quick Launch')).toBeVisible();
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutLink.click();
  }

  async goToPim() {
    await this.pimMenu.click();
    await expect(this.header).toHaveText('PIM');
  }

  async expectSidebarNavigation() {
    await expect(this.adminMenu).toBeVisible();
    await this.adminMenu.click();
    await expect(this.page).toHaveURL(/\/admin\/viewSystemUsers/);

    await this.pimMenu.click();
    await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/);
  }
}
