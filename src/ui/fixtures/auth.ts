import { Page } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { getRequiredEnv } from '../../utils/env';

const adminPassword = getRequiredEnv('ORANGE_HRM_PASSWORD');
const adminUsername = getRequiredEnv('ORANGE_HRM_USERNAME');

export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await loginPage.goto();
    await loginPage.login(adminUsername, adminPassword);

    try {
      await dashboardPage.expectLoaded();

      return { dashboardPage, loginPage };
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }

      await page
        .goto('/web/index.php/auth/logout', {
          timeout: 45_000,
          waitUntil: 'domcontentloaded',
        })
        .catch(() => undefined);
    }
  }

  return { dashboardPage, loginPage };
}

export const orangeHrmCredentials = {
  adminPassword,
  adminUsername,
};
