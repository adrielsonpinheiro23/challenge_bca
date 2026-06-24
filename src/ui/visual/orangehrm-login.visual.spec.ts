import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('OrangeHRM visual regression', () => {
  test('login page keeps the expected layout', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await expect(page).toHaveScreenshot('orangehrm-login-page.png', {
      animations: 'disabled',
      fullPage: true,
      mask: [
        page.locator('.orangehrm-login-branding'),
        page.locator('.orangehrm-login-logo'),
        page.locator('.orangehrm-copyright-wrapper'),
      ],
      maxDiffPixelRatio: 0.02,
    });
  });
});
