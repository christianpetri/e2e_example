// playwright/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file ONCE
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

const DEBUG_CONFIG = process.env.DEBUG_PLAYWRIGHT_CONFIG === 'true';
const TRACE_ENABLED = process.env.PLAYWRIGHT_TRACE === 'true';

if (DEBUG_CONFIG) {
  console.log(`[CONFIG DEBUG] FRONTEND_BASE_URL: ${FRONTEND_BASE_URL}`);
  console.log(`[CONFIG DEBUG] BACKEND_API_URL: ${BACKEND_API_URL}`);
  console.log(`[CONFIG DEBUG] TEST_USERNAME (from env): ${process.env.TEST_USERNAME}`);
  console.log(`[CONFIG DEBUG] TEST_PASSWORD (from env): ${process.env.TEST_PASSWORD ? 'SET' : 'NOT SET'}`);
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  globalSetup: require.resolve('./auth.setup'), // Global setup for UI login

  use: {
    baseURL: FRONTEND_BASE_URL, // Default base URL for `page.goto('/')` (UI tests)
    trace: TRACE_ENABLED ? 'on-first-retry' : 'off', // Enable trace only if PLAYWRIGHT_TRACE is 'true'
    storageState: 'storageState.json', // Load saved auth state for UI tests by default
  },

  projects: [
    {
      name: 'chromium-ui',
      testMatch: 'tests/ui/**/*.spec.ts', // This will now match all UI tests *except* login.ui.spec.ts
      // if login.ui.spec.ts is specifically excluded or another project targets it.
      // Make sure this doesn't accidentally include login.ui.spec.ts if you want it separate.
      // A common pattern is `testMatch: 'tests/ui/!(*.login).spec.ts'` or specific folders.
      // For now, let's ensure login.ui.spec.ts is ONLY matched by 'chromium-ui-unauth'.
      testIgnore: 'tests/ui/login.ui.spec.ts', // <--- ADD THIS LINE TO EXCLUDE login.ui.spec.ts from regular UI tests
      use: {
        ...devices['Desktop Chrome'],
        // Inherits baseURL and storageState from top-level `use`
      },
    },
    {
      name: 'api-backend',
      testMatch: 'tests/api/**/*.api.spec.ts',
      use: {
        baseURL: FRONTEND_BASE_URL,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // No storageState here, as API tests perform their own login for explicit token
      },
    },
     
    {
      name: 'chromium-ui-unauth',
      testMatch: 'tests/ui/login.ui.spec.ts', // <--- ONLY match the login test file
      use: {
        ...devices['Desktop Chrome'],
        baseURL: FRONTEND_BASE_URL,
        storageState: undefined, // <--- IMPORTANT: Ensure no pre-existing auth state for this project
      },
    },
  ],

  webServer: [
    {
      command: 'npm run serve',
      url: 'http://localhost:8080',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, '../app/frontend')
    },
    {
      command: 'npm run dev',
      url: `${BACKEND_API_URL}/api/status`, // Check /api/status, which reliably returns 200
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, '../app/backend')
    }
  ],
});