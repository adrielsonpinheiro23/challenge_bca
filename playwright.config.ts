import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './src',
  timeout: 60_000,
  fullyParallel: true,
  // Protect CI from accidentally committed focused tests.
  forbidOnly: isCI,
  // Public demo apps can be slower in CI, so retry there only.
  retries: isCI ? 2 : 0,
  // OrangeHRM is a shared public demo; serial execution is slower but much less flaky.
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],
  expect: {
    timeout: 15_000,
  },
  use: {
    // Trace and screenshots make failures easier to debug in the HTML report.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'api',
      testMatch: /src\/api\/tests\/.*\.spec\.ts/,
      use: {
        // ReqRes now requires x-api-key. Tests fail fast if REQRES_API_KEY is missing.
        baseURL: process.env.REQRES_BASE_URL ?? 'https://reqres.in',
        extraHTTPHeaders: process.env.REQRES_API_KEY
          ? { 'x-api-key': process.env.REQRES_API_KEY }
          : {},
      },
    },
    {
      name: 'chromium',
      testMatch: /src\/ui\/tests\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ORANGE_HRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
      },
    },
    {
      name: 'firefox',
      testMatch: /src\/ui\/tests\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.ORANGE_HRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
      },
    },
    {
      name: 'webkit',
      testMatch: /src\/ui\/tests\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.ORANGE_HRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
      },
    },
  ],
});
