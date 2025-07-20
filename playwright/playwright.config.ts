// playwright/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Load environment variables from .env file at the project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

// Define your base URLs and API paths for clarity and reuse
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080/';
const JAVA_API_BASE_PATH = process.env.JAVA_API_BASE_PATH || 'internal/api';

// *** IMPORTANT: This path MUST match the one used in auth.setup.ts ***
// It resolves to 'YOUR_PROJECT_ROOT/playwright/auth/storageState.json'
const STORAGE_STATE_PATH = path.resolve(__dirname, './auth/storageState.json');

export default defineConfig({
  //globalSetup: require.resolve('./auth.setup.ts'),
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  //use: {
  //  trace: 'on-first-retry',
  //  storageState: STORAGE_STATE_PATH,
  //},

  projects: [
    {
      name: 'chromium-ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: FRONTEND_BASE_URL,
      },
      testMatch: 'tests/ui/**/*.spec.ts',
    },
    {
      name: 'api-backend',
      use: {
        baseURL: `${FRONTEND_BASE_URL}${JAVA_API_BASE_PATH}`,
      },
      testMatch: 'tests/api/**/*.api.spec.ts',
    },
  ],

  webServer: [
    {
      command: 'docker compose up -d tomcat',
      url: `${FRONTEND_BASE_URL}${JAVA_API_BASE_PATH}status`,
      timeout: 240 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, '../'),
      env: {
        DEBUG: 'pw:webserver',
      },
    },
  ],
});