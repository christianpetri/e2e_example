import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
const JAVA_API_BASE_PATH = process.env.JAVA_API_BASE_PATH || '/internal/api';
const STORAGE_FILE = path.resolve(__dirname, '../auth/storageState.json');

async function loginAndGetToken(): Promise<string> {
  const credentials = {
    username: process.env.TEST_USERNAME || 'testuser',
    password: process.env.TEST_PASSWORD || 'testpassword',
  };
  console.log(`Login Request URL: ${FRONTEND_BASE_URL}${JAVA_API_BASE_PATH}login`);

  const loginContext = await request.newContext({
    baseURL: `${FRONTEND_BASE_URL}${JAVA_API_BASE_PATH}`,
  });

  const loginResponse = await loginContext.post('login', { data: credentials });
  if (loginResponse.status() !== 200) {
    throw new Error(`Login failed: ${loginResponse.status()}`);
  }

  const loginBody = await loginResponse.json();
  await loginContext.dispose();

  return loginBody.token;
}

export async function createApiClient(auth = true) {
  const baseURL = `${FRONTEND_BASE_URL}${JAVA_API_BASE_PATH}`;
  const headers: Record<string, string> = {};

  if (auth) {
    headers['Authorization'] = `Bearer ${await loginAndGetToken()}`;
  }

  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });

  const logRequest = (method: string, url: string) => {
    console.log(`Request: ${method.toUpperCase()} ${baseURL}${url}`);
  };

  const handle = {
    get: async (url: string) => {
      logRequest('get', url);
      let response = await context.get(url);

      if (response.status() === 401 && auth) {
        console.warn('Unauthorized. Retrying with refreshed token...');
        const refreshedToken = await loginAndGetToken();
        headers['Authorization'] = `Bearer ${refreshedToken}`;
        const retryContext = await request.newContext({ baseURL, extraHTTPHeaders: headers });
        response = await retryContext.get(url);
        await retryContext.dispose();
      }

      return response;
    },

    post: async (url: string, body: any) => {
      logRequest('post', url);
      const response = await context.post(url, { data: body });
      return response;
    },

    dispose: async () => {
      await context.dispose();
      console.log('API context disposed.');
    },
  };

  console.log('API client initialized');
  console.log(`Base URL: ${baseURL}`);
  console.log(auth ? 'Authentication enabled' : 'No authentication applied');

  return handle;
}
