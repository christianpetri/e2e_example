// playwright/tests/ui/basic.ui.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic Public UI Functionality', () => {

  test('should load the homepage and display the main title', async ({ page }) => {
    // Uses baseURL from playwright.config.ts (FRONTEND_BASE_URL)
    await page.goto('/');

    // Check for the page title
    await expect(page).toHaveTitle(/Frontend App/); // Adjust regex if title changes

    // Check for the main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Frontend Application');
  });

  test('should display "Backend is online!" message', async ({ page }) => {
    await page.goto('/'); // Navigate to the frontend app
    // Playwright will automatically wait for the element to appear
    await expect(page.locator('.backend-status-message')).toBeVisible();
    await expect(page.locator('.backend-status-message')).toHaveText('Backend is online!');
  });

  test('should fetch and display public data via UI button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Fetch Public Data' }).click();

    // Wait for the data to appear on the page
    const dataParagraph = page.locator('p:has-text("This is public data from the backend!")');
    await expect(dataParagraph).toBeVisible();
  });

});