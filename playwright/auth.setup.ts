// playwright/auth.setup.ts
import { chromium, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

async function globalSetup() {
  // Load environment variables for globalSetup specifically
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
  const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

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
  // This is CRUCIAL: Wait for an element that appears ONLY after successful login
  // Replace 'p:has-text("Login successful")' with a more robust locator if needed,
  // or wait for a URL change away from '/login'
  await expect(page.locator('p:has-text("Login successful")')).toBeVisible({ timeout: 10000 });
  console.log('UI Login confirmed: "Login successful" message visible.');

  // Optional: Wait for any async token storage to complete
  // You might need a short timeout here if token storage is slightly delayed after UI update
  await page.waitForTimeout(500); // Give it a moment

  // Save the storage state (cookies, localStorage, sessionStorage) for future test runs
  // This will include any token/session data your frontend manages internally
  await page.context().storageState({ path: 'storageState.json' });

  console.log('Storage state saved to storageState.json for authenticated tests.');
  await browser.close();
  console.log('--- Playwright Global Setup Complete ---');
}

export default globalSetup;