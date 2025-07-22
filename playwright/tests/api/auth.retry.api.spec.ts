import { test, expect } from "@playwright/test";
import { createApiClient } from "../../utils/apiClient";
import fs from "fs";
import path from "path";

test.describe("API Client Token Retry Handling", () => {
  test.beforeAll(() => {
    // Inject an invalid token into the storageState for simulation
    const storageFile = path.resolve(
      path.dirname(__filename),
      "../../auth/storageState.json",
    );
    const raw = fs.readFileSync(storageFile, "utf-8");
    const state = JSON.parse(raw);

    const frontendOrigin = state.origins.find(
      (o: any) => o.origin === process.env.FRONTEND_BASE_URL,
    );

    const tokenEntry = frontendOrigin?.localStorage.find(
      (i: any) => i.name === "bearerToken",
    );
    if (tokenEntry) {
      tokenEntry.value = "expired-or-invalid-token"; // Trigger 401 response intentionally
      fs.writeFileSync(storageFile, JSON.stringify(state, null, 2), "utf-8");
    }
  });

  test("Retry on 401 with refreshed token", async () => {
    const client = await createApiClient(true);

    const response = await client.get("data");
    const body = await response.json();

    console.log(`Final Status: ${response.status()}`);
    console.log(`Response Body:`, body);

    expect(response.status()).toBe(200); // Should succeed after retry
    expect(body.message).toContain(
      "This is protected data from the Java backend!",
    );

    await client.dispose();
  });
});
