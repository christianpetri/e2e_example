// playwright/tests/api/auth.api.spec.ts
import { test, expect } from '@playwright/test';
// Removed: path, dotenv imports (these are handled by playwright.config.ts)
// Removed: FRONTEND_BASE_URL, BACKEND_API_URL constants (these are configured in playwright.config.ts)

// Define TEST_USERNAME and TEST_PASSWORD for direct use in test logic
// These are specific to the test's data payload and are fine here.
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

test.describe('Authenticated API Tests', () => {

    test('should access protected user profile API', async ({ request }) => {
        // Perform API login directly within this test to get the token
        // Playwright's `request` fixture will automatically use the `baseURL`
        // configured for the 'api-backend' project in `playwright.config.ts`.
        const loginResponse = await request.post('/api/login', { // Correct: Use relative path
            data: {
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
            },
        });
        expect(loginResponse.status()).toBe(200);
        const loginData = await loginResponse.json();
        const bearerToken = loginData.token;

        if (!bearerToken) {
            throw new Error('API Login did not return a token.');
        }

        const response = await request.get('/api/protected', { // Correct: Use relative path
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.message).toContain('This is protected data!');
        expect(data.user).toBe(TEST_USERNAME);
    });

    test('should create a new protected resource via API', async ({ request }) => {
        // Same logic for obtaining token: API login
        const loginResponse = await request.post('/api/login', {
            data: {
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
            },
        });
        expect(loginResponse.status()).toBe(200);
        const loginData = await loginResponse.json();
        const bearerToken = loginData.token;

        if (!bearerToken) {
            throw new Error('API Login did not return a token for resource creation test.');
        }

        const newResourceData = {
            name: `Playwright Resource ${Date.now()}`,
            description: 'A resource created by an authenticated API test.',
        };

        const response = await request.post('/api/resource', { // Correct: Use relative path
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
            data: newResourceData,
        });

        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.message).toContain('Resource created successfully');
        expect(data.resource.name).toBe(newResourceData.name);
    });
});