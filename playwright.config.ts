import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const browserTests = { testDir: './tests', testIgnore: '**/api/**' };

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: env.isCI,
  // The target is a shared public practice site that answers "under heavy
  // load (queue full)" when hit too hard. Two workers keep the request rate
  // polite; retried tests are still reported as flaky, never hidden.
  retries: env.isCI ? 2 : 1,
  workers: 2,
  reporter: [
    [env.isCI ? 'github' : 'list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: env.baseURL,
    testIdAttribute: 'data-qa',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'chromium', ...browserTests, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', ...browserTests, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', ...browserTests, use: { ...devices['Desktop Safari'] } },
  ],
});
