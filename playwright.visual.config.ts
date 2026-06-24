import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './src/ui/visual',
  timeout: 60_000,
  reporter: [['html', { outputFolder: 'reports/playwright-visual-html', open: 'never' }]],
  expect: {
    timeout: 15_000,
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.ORANGE_HRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
});
