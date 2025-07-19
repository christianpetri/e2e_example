//playwright/tests/ui/authenticated-ui.spec.ts
import { test, expect } from '@playwright/test';

// Define TEST_USERNAME for assertions in the UI.
// You might get this from process.env if your test environment sets it.
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';

test.describe('Authenticated UI Tests', () => {

    // This test will automatically start with a logged-in session
    // because of the globalSetup and storageState.json setup in playwright.config.ts
    test('should access and display protected user profile data via UI', async ({ page }) => {
        // 1. Navigate to the main page of your frontend application.
        // The baseURL in playwright.config.ts points to http://localhost:8080.
        await page.goto('/'); // Navigate to your frontend's base URL

        // 2. Wait for the Backend Status to confirm it's online.
        // This is good practice to ensure the app is ready and talking to backend.
        await expect(page.locator('.backend-status-message')).toHaveText('Backend is online!');

        // 3. Click the "Fetch Protected Data" button.
        // Based on your App.vue, there's a button with specific text.
        await page.getByRole('button', { name: 'Fetch Protected Data (Requires Login)' }).click();

        // 4. Assert that the protected data message appears in the UI.
        // Based on your App.vue, the protected data appears in a <p class="data-message">
        // that has `v-if="protectedData"`.
        await expect(page.locator('p.data-message')).toBeVisible(); // Check visibility first
        await expect(page.locator('p.data-message')).toContainText('This is protected data from the backend!');
        //await expect(page.locator('p.data-message')).toContainText(`"This is protected data from the backend!`); // Assuming backend also returns user data

        console.log('Successfully accessed and verified protected dashboard content via UI.');
    });

    // Converting the 'should create a new protected resource via API' test:
    // This depends entirely on whether your frontend has a UI for creating resources.
    // If it does, the structure would be:
    /*
    test('should create a new protected resource via UI', async ({ page }) => {
        await page.goto('/resource-creation-page'); // Or navigate through UI to the form

        // Fill out the form fields
        await page.getByLabel('Resource Name').fill(`New UI Resource ${Date.now()}`);
        await page.getByLabel('Description').fill('Created through UI test.');

        // Click the submit button
        await page.getByRole('button', { name: 'Create Resource' }).click();

        // Assert on the UI confirmation message (e.g., success message, redirection)
        await expect(page.locator('.success-notification')).toBeVisible();
        await expect(page.locator('.success-notification')).toContainText('Resource created successfully');

        console.log('Successfully created a new protected resource via UI.');
    });
    */
    // If there's no UI for it, this test might remain an API test in a separate file,
    // or it might not be relevant for a pure E2E UI suite.
});