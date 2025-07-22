import { test, expect, request } from "@playwright/test";
import { createApiClient } from "../../utils/apiClient";

const TEST_USERNAME = process.env.TEST_USERNAME || "testuser";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "testpassword";

test.describe("Authenticated Java Backend API Tests", () => {
  test("Login via API should return token", async ({ request }) => {
    const credentials = { username: TEST_USERNAME, password: TEST_PASSWORD };
    const response = await request.post("login", { data: credentials });

    //console.log(`[Login Test] Status: ${response.status()}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    //console.log(`[Login Test] Token acquired.`);
  });

  test("Access public data", async () => {
    const api = await createApiClient(false); // No auth
    const response = await api.get("public-data");
    const body = await response.json();

    //console.log(`[Public API] Status: ${response.status()}`);
    //console.log(`[Public API] Body:`, body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(
      "This is public data from the Java backend!",
    );

    await api.dispose();
  });

  test("Create a new protected resource with bearer token", async () => {
    const api = await createApiClient(true); // Auth
    const newResource = {
      name: `Playwright Resource ${Date.now()}`,
      description: "Created via Playwright",
      version: 1.0,
    };

    const response = await api.post("resource", newResource);
    const body = await response.json();

    //console.log(`[Resource Creation] Status: ${response.status()}`);
    //console.log(`[Resource Creation] Body:`, body);

    expect(response.status()).toBe(201);
    expect(body.message).toContain("Resource created successfully!");
    expect(body.resource.name).toBe(newResource.name);

    // Remove volatile fields before snapshot
    const { id, name, ...stableFields } = body.resource;
    const sanitizedResource = {
      ...stableFields,
      createdBy: "REDACTED",
    };
    //console.log(`[Resource Creation] Sanitized Resource:`, sanitizedResource);
    expect(JSON.stringify(sanitizedResource, null, 2)).toMatchSnapshot(
      "new-resource-snapshot.json",
    );

    await api.dispose();
  });

  test("Access protected data without token should fail", async () => {
    const api = await createApiClient(false); // No auth
    const response = await api.get("data");
    const body = await response.json();

    //console.log(`[Unauthorized Access] Status: ${response.status()}`);
    //console.log(`[Unauthorized Access] Body:`, body);

    expect(response.status()).toBe(401);
    expect(body.message).toContain("Unauthorized: No valid token provided");

    await api.dispose();
  });

  test("Probe endpoint to confirm baseURL behavior", async () => {
    const baseURL = "http://localhost:8080/internal/api/";

    const context = await request.newContext({ baseURL });
    //console.log('Context created with baseURL:', baseURL);

    const response = await context.get("probe"); // resolved as baseURL + '/probe'
    const body = await response.json();

    //console.log('Probe Response Status:', response.status());
    //console.log('Probe Response Body:', body);

    expect(response.status()).toBe(200);
    expect(body.status).toBe("probe received");

    await context.dispose();
  });
});
