import { Page } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { getRequiredEnv } from '../../utils/env';

const adminPassword = getRequiredEnv('ORANGE_HRM_PASSWORD');
const adminUsername = getRequiredEnv('ORANGE_HRM_USERNAME');

export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login(adminUsername, adminPassword);
  await dashboardPage.expectLoaded();

  return { dashboardPage, loginPage };
}

export const orangeHrmCredentials = {
  adminPassword,
  adminUsername,
};
