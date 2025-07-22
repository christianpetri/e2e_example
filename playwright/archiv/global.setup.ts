// playwright/tests/global.setup.ts
// REMOVED: import 'dotenv/config'; // No longer needed as values are hardcoded

import { chromium, expect, Page } from "@playwright/test";
import path from "path";
import * as fs from "fs";

// Hardcoded values for simplicity (for debugging purposes)
const FRONTEND_BASE_URL_HARDCODED = "http://localhost:8080";
const TEST_USERNAME_HARDCODED = "testuser";
const TEST_PASSWORD_HARDCODED = "testpassword";

// Define paths for consistency
const STORAGE_STATE_PATH = path.join(__dirname, "../.auth/user.json");
const AUTH_DIR = path.join(__dirname, "../.auth");

async function globalSetup() {
  console.log("\n--- Running Playwright Global Setup (Login) ---");
  console.log(`Attempting UI login to: ${FRONTEND_BASE_URL_HARDCODED}`);

  // --- Directory Existence and Writability Check ---
  console.log(`Checking/creating authentication directory: ${AUTH_DIR}`);
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      console.log(`Successfully created directory: ${AUTH_DIR}`);
    } else {
      console.log(`Directory already exists: ${AUTH_DIR}`);
    }

    const tempFilePath = path.join(AUTH_DIR, "temp_write_test.tmp");
    fs.writeFileSync(tempFilePath, "test");
    fs.unlinkSync(tempFilePath);
    console.log(`Directory is writable: ${AUTH_DIR}`);
  } catch (dirError) {
    console.error(
      `ERROR: Failed to create or write to authentication directory '${AUTH_DIR}'.`,
    );
    console.error(
      `Please check permissions for this path. Original error: ${dirError}`,
    );
    throw dirError;
  }
  // --- END NEW CHECK ---

  let browser;
  let page: Page | null = null;

  try {
    console.log("Launching browser for global setup...");
    browser = await chromium.launch();
    page = await browser.newPage();
    console.log("Browser launched. Navigating to frontend base URL...");

    // Navigate to the login page
    await page.goto(FRONTEND_BASE_URL_HARDCODED, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log(`Navigated to ${FRONTEND_BASE_URL_HARDCODED}`);
    await page.screenshot({ path: "playwright-setup-1-after-goto.png" });

    // Wait for the login form elements to be visible and fill them using data-testid
    console.log("Waiting for login form elements...");
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.locator('[data-testid="login-username-input"]'),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('[data-testid="login-password-input"]'),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({
      timeout: 10000,
    });
    console.log("Login form elements visible. Filling credentials...");

    await page
      .locator('[data-testid="login-username-input"]')
      .fill(TEST_USERNAME_HARDCODED);
    await page
      .locator('[data-testid="login-password-input"]')
      .fill(TEST_PASSWORD_HARDCODED);
    await page.screenshot({ path: "playwright-setup-2-after-fill.png" });
    console.log("Credentials filled. Clicking login button...");

    // Click the login button using data-testid
    await page.locator('[data-testid="login-button"]').click();
    console.log("Login button clicked. Waiting for login success indicator...");

    // Assert successful login by waiting for the protected data button to be enabled
    await expect(
      page.locator('button:has-text("Fetch Protected Data (Requires Login)")'),
    ).toBeEnabled({ timeout: 20000 });
    console.log(
      'UI Login confirmed: "Fetch Protected Data" button is enabled.',
    );
    await page.screenshot({
      path: "playwright-setup-3-after-login-success.png",
    });

    // Save the authentication state
    await page.context().storageState({ path: STORAGE_STATE_PATH });
    console.log(`Authentication state saved to: ${STORAGE_STATE_PATH}`);
  } catch (error) {
    console.error(
      "Playwright Global setup failed during login or browser interaction:",
      error,
    );
    // Capture a screenshot on failure, using the 'page' variable if it was successfully created
    if (page && !page.isClosed()) {
      await page.screenshot({ path: "playwright-setup-failure-final.png" });
      console.log(
        "Screenshot on failure saved to playwright-setup-failure-final.png",
      );
    } else if (browser && browser.isConnected()) {
      // Fallback: if 'page' wasn't created or was closed, try to create a new page for screenshot
      try {
        const tempPage = await browser.newPage();
        await tempPage.screenshot({
          path: "playwright-setup-failure-fallback.png",
        });
        await tempPage.close();
        console.log(
          "Fallback screenshot on failure saved to playwright-setup-failure-fallback.png",
        );
      } catch (screenshotError) {
        console.error("Could not take fallback screenshot:", screenshotError);
      }
    }
    throw error;
  } finally {
    if (browser && browser.isConnected()) {
      await browser.close();
      console.log("Browser closed.");
    }
    console.log("--- Playwright Global Setup Complete ---");
  }
}

export default globalSetup;
