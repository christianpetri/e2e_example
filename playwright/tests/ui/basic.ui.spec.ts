// playwright/tests/ui/basic.ui.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic UI Functionality', () => {
  test('should navigate to the homepage and display title', async ({ page }) => {
    // Uses baseURL from playwright.config.ts (FRONTEND_BASE_URL)
    await page.goto('/');
    await expect(page).toHaveTitle(/Frontend App/);

    // Check for the main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Frontend Application');
  });

  test('should fetch public data via UI button', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Fetch Public Data")');

    // Wait for the data to appear on the page
    const dataParagraph = page.locator('p:has-text("This is public data from the Java backend!")');
    await expect(dataParagraph).toBeVisible();
  });
});