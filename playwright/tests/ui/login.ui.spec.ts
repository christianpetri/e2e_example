// playwright/tests/ui/login.ui.spec.ts
import { test, expect } from '@playwright/test';

const TEST_USERNAME = process.env.TEST_USERNAME || 'defaultuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'defaultpass';

test.describe('Login UI Functionality', () => {

  test('should allow a user to log in successfully', async ({ page }) => {
    await test.step('Navigate to the login page', async () => {
      await page.goto('/');
    });

    await test.step('Fill out the login form', async () => {
      const loginForm = page.locator('[data-testid="login-form"]');

      await loginForm.locator('[data-testid="login-username-input"]').fill(TEST_USERNAME);
      await loginForm.locator('[data-testid="login-password-input"]').fill(TEST_PASSWORD);
      await loginForm.locator('[data-testid="login-button"]').click();
    });
    
    await test.step('Verify successful login on the same page', async () => {
      // Assert that the success message is visible, matching "Login successful" from the snapshot
      await expect(page.locator('p:has-text("Login successful")')).toBeVisible({ timeout: 10000 });

      // Assert that the 'Fetch Protected Data' button becomes enabled
      await expect(page.locator('button:has-text("Fetch Protected Data (Requires Login)")')).toBeEnabled();
    });
  });

  test('should display an error message for invalid credentials', async ({ page }) => {
    await test.step('Navigate to the login page', async () => {
      await page.goto('/');
    });

    await test.step('Fill out the form with invalid credentials', async () => {
      const loginForm = page.locator('[data-testid="login-form"]');

      await loginForm.locator('[data-testid="login-username-input"]').fill('invaliduser');
      await loginForm.locator('[data-testid="login-password-input"]').fill('wrongpass');
      await loginForm.locator('[data-testid="login-button"]').click();
    });

    await test.step('Verify error message is displayed', async () => {
      // Assert that the red error message 'Invalid credentials' is visible
      await expect(page.locator('p:has-text("Invalid credentials")')).toBeVisible();
      // Ensure the page did not redirect
      await expect(page).toHaveURL('http://localhost:8080/');
    });
  });

});