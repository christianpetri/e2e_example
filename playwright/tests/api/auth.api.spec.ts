// playwright/tests/api/auth.api.spec.ts
import { test, expect } from '@playwright/test';

// Define TEST_USERNAME and TEST_PASSWORD for direct use in test logic
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

test.describe('Authenticated API Tests', () => {

    test('should access protected user profile API', async ({ request }) => {
        // Perform API login directly within this test to get the token
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
            throw new Error('API Login did not return a token.');
        }

        const response = await request.get('/api/data', { // Corrected: Was '/api/protected'
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.message).toContain('This is protected data from the backend!');
        expect(data.user).toBe(TEST_USERNAME);
    });

    // --- UPDATED TEST FOR NEW POST /api/resource ENDPOINT ---
    test('should create a new protected resource via API and echo data', async ({ request }) => {
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
            name: `Playwright Resource ${Date.now()}`, // Unique name
            description: 'A resource created by an authenticated API test.',
            version: 1.0
        };

        const response = await request.post('/api/resource', { // Now this endpoint exists!
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
            data: newResourceData, // Send the data
        });

        expect(response.status()).toBe(201); // Expect 201 Created
        const data = await response.json();

        expect(data.message).toContain('Resource created successfully!');
        expect(data.resource).toBeDefined();
        expect(data.resource.id).toBeDefined(); // Check for dummy ID
        expect(data.resource.createdBy).toBe(TEST_USERNAME); // Check creator
        expect(data.resource.name).toBe(newResourceData.name); // Check echoed data
        expect(data.resource.description).toBe(newResourceData.description);
        expect(data.resource.version).toBe(newResourceData.version); // Check echoed data
    });
});