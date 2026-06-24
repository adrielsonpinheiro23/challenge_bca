import { expect, test } from '@playwright/test';
import { loginAsAdmin, orangeHrmCredentials } from '../fixtures/auth';
import { createEmployeeData } from '../fixtures/employees';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';

test.describe('OrangeHRM UI', () => {
  test('successful login opens the dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/dashboard\/index/, { timeout: 45_000 });
  });

  test('failed login with invalid password shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(orangeHrmCredentials.adminUsername, 'wrong-password');
    await loginPage.expectInvalidCredentialsMessage();
  });

  test('failed login with empty fields shows required validation', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitEmptyForm();
    await loginPage.expectRequiredMessages();
  });

  test('logout returns the user to the login page', async ({ page }) => {
    const { loginPage, dashboardPage } = await loginAsAdmin(page);

    await dashboardPage.logout();
    await loginPage.expectLoginPageVisible();
  });

  test('PIM navigation shows the employee list', async ({ page }) => {
    const { dashboardPage } = await loginAsAdmin(page);
    const pimPage = new PimPage(page);

    await dashboardPage.goToPim();
    await pimPage.expectEmployeeListVisible();
  });

  test('employee search returns results or an empty-state message', async ({ page }) => {
    const { dashboardPage } = await loginAsAdmin(page);
    const pimPage = new PimPage(page);

    // Public demo data changes often, so this validates either valid outcome.
    await dashboardPage.goToPim();
    await pimPage.searchEmployee('John');
    await pimPage.expectSearchCompleted();
  });

  test('employee search shows no records for an unknown employee', async ({ page }) => {
    const { dashboardPage } = await loginAsAdmin(page);
    const pimPage = new PimPage(page);

    await dashboardPage.goToPim();
    await pimPage.searchEmployeeById('999999999');
    await pimPage.expectNoRecordsFound();
  });

  test('add employee saves a new employee profile', async ({ page }) => {
    // Unique data avoids collisions in the shared OrangeHRM demo environment.
    const employee = createEmployeeData();
    const { dashboardPage } = await loginAsAdmin(page);
    const pimPage = new PimPage(page);

    await dashboardPage.goToPim();
    await pimPage.addEmployee(employee.firstName, employee.lastName, employee.employeeId);
    await pimPage.expectPersonalDetails(employee.firstName, employee.lastName);
  });

  test('dashboard widgets are visible after login', async ({ page }) => {
    const { dashboardPage } = await loginAsAdmin(page);

    await dashboardPage.expectLoaded();
  });

  test('sidebar menu items navigate to expected pages', async ({ page }) => {
    const { dashboardPage } = await loginAsAdmin(page);

    await dashboardPage.expectSidebarNavigation();
  });
});
