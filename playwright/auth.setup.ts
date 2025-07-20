// playwright/auth.setup.ts
import { chromium, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs'; // Import fs module for file system operations

async function globalSetup() {
  // Load environment variables for globalSetup specifically (e.g., from .env in project root)
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
  const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

  // Define the storage directory and file path relative to auth.setup.ts
  const STORAGE_DIR = path.resolve(__dirname, 'auth'); // This will be e.g., '.../playwright/auth'
  const STORAGE_FILE = path.join(STORAGE_DIR, 'storageState.json'); // This will be e.g., '.../playwright/auth/storageState.json'

  // 1. Create folder if it doesn't exist
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log(`✅ Created folder for auth state: ${STORAGE_DIR}`);
  }

  console.log('\n--- Running Playwright Global Setup (Login) ---');
  console.log(`Attempting UI login to: ${FRONTEND_BASE_URL}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the login page
  await page.goto(FRONTEND_BASE_URL);

  // Fill login form
  await page.fill('input[type="text"]', TEST_USERNAME);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Login")');

  // Wait for successful login indicator (e.g., "Login successful" text)
  await expect(page.locator('p:has-text("Login successful")')).toBeVisible({ timeout: 10000 });
  console.log('UI Login confirmed: "Login successful" message visible.');

  // Optional: Wait for any async token storage to complete
  await page.waitForTimeout(500); // Give it a moment

  // Save the storage state (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: STORAGE_FILE }); // Use the defined STORAGE_FILE path

  console.log(`Storage state saved to: ${STORAGE_FILE} for authenticated tests.`);
  await browser.close();
  console.log('--- Playwright Global Setup Complete ---');
}

export default globalSetup;