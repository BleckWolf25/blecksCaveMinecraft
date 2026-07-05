/**
 *
 * @file playwright.config.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Playwright configuration file for end-to-end testing.
 *
 * @description
 * This configuration file sets up Playwright for end-to-end testing of the application.
 * It defines the test directory, parallel execution settings, retry logic, and browser configurations.
 * The configuration also includes a web server setup to run the application during tests.
 *
 * @since 01/07/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { defineConfig, devices } from '@playwright/test';

// ---------- CONFIGURATION
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
