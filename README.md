# Full-Stack Application with Vue.js, Node.js API, and Playwright E2E Tests

This repository contains a simple full-stack application demonstrating a Vue.js frontend, a Node.js Express backend API, and end-to-end (E2E) tests using Playwright. It highlights common development patterns, including API proxying in development and integrated deployment for production.

---

## Table of Contents

- [Full-Stack Application with Vue.js, Node.js API, and Playwright E2E Tests](#full-stack-application-with-vuejs-nodejs-api-and-playwright-e2e-tests)
  - [Table of Contents](#table-of-contents)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Project Setup](#2-project-setup)
    - [Environment Variables](#environment-variables)
    - [Install Dependencies](#install-dependencies)
  - [3. Running the Application (Development)](#3-running-the-application-development)
    - [Start Backend API](#start-backend-api)
    - [Start Frontend Dev Server](#start-frontend-dev-server)
    - [Development Proxy Explained (Frontend 8080 to Backend 3000)](#development-proxy-explained-frontend-8080-to-backend-3000)
  - [4. Running Playwright Tests](#4-running-playwright-tests)
    - [Playwright's `webServer` Configuration](#playwrights-webserver-configuration)
    - [Run All Tests](#run-all-tests)
    - [Run UI Tests](#run-ui-tests)
    - [Run API Tests](#run-api-tests)
    - [Playwright UI Mode (Interactive Debugging)](#playwright-ui-mode-interactive-debugging)
  - [5. Production Deployment Notes (Single WAR)](#5-production-deployment-notes-single-war)
  - [6. Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js & npm:** (LTS version recommended)
  - [Download Node.js](https://nodejs.org/en/download/)
- **Java Development Kit (JDK):** (e.g., JDK 11 or newer)
  - [Download OpenJDK](https://openjdk.java.net/install/)
- **Apache Maven or Gradle:** (If your Java backend is built with one of these)
  - [Download Maven](https://maven.apache.org/download.cgi)
  - [Download Gradle](https://gradle.org/install/)
- **Apache Tomcat:** (Version 9 or higher recommended)
  - [Download Tomcat](https://tomcat.apache.org/download-90.cgi)

---

## 2. Project Setup

### Environment Variables

Create a `.env` file in the **root directory** of your project (`e2e_example/.env`). This file will hold configuration for both your frontend, backend, and Playwright tests.

```dotenv
# e2e_example/.env

# Frontend URL (for Playwright and general reference)
FRONTEND_BASE_URL=http://localhost:8080

# Backend API URL (for Playwright API tests and general reference)
BACKEND_API_URL=http://localhost:3000
BACKEND_PORT=3000 # Port for the Node.js backend

# Frontend Origin for Backend CORS (if backend needs to allow specific origins)
FRONTEND_ORIGIN=http://localhost:8080

# Test Credentials (used by Playwright tests and backend for demo login)
TEST_USERNAME=testuser
TEST_PASSWORD=testpass

# Playwright Debugging Flags (set to 'true' for verbose output/tracing)
DEBUG_PLAYWRIGHT_CONFIG=false
PLAYWRIGHT_TRACE=false
```

### Install Dependencies

Navigate into each project directory and install its dependencies:

```bash
# From the project root (e2e_example)

# Install frontend dependencies
cd app/frontend
npm install
cd .. # Go back to app/

# Install backend dependencies
cd backend
npm install
cd ../.. # Go back to project root

# Install Playwright dependencies (from the 'playwright' directory)
cd playwright
npm install
npm install --save-dev @types/node # Crucial for TypeScript to recognize 'process'
cd .. # Go back to project root
```

---

## 3. Running the Application (Development)

For development, the frontend and backend run as separate processes. The frontend's development server includes a proxy to seamlessly route API calls.

### Start Backend API

Open a **new terminal window** and run the backend server:

```bash
# From the project root (e2e_example)
cd app/backend
npm run dev
```

You should see output indicating the backend server is listening on `http://localhost:3000`. (Note: Visiting `http://localhost:3000/` directly in a browser will likely show "Cannot GET /" as it's an API-only server, which is normal.)

### Start Frontend Dev Server

Open **another new terminal window** and run the frontend development server:

```bash
# From the project root (e2e_example)
cd app/frontend
npm run serve
```

This will start the Vue.js application, typically accessible at `http://localhost:8080`.

### Development Proxy Explained (Frontend 8080 to Backend 3000)

In development, your Vue.js frontend (served by Webpack Dev Server on `http://localhost:8080`) needs to communicate with your Node.js backend (on `http://localhost:3000`). Browsers enforce the **Same-Origin Policy**, which would normally block direct JavaScript calls from `8080` to `3000` (different ports = different origins) due to CORS.

To solve this, your `app/frontend/vue.config.js` is configured with a **proxy**:

```javascript
// app/frontend/vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': { // When Vue.js code calls /api/login (i.e., http://localhost:8080/api/login)
        target: 'http://localhost:3000', // The Webpack Dev Server forwards it to http://localhost:3000/api/login
        changeOrigin: true,
      }
    }
  }
};
```

This means:

- Your Vue.js code continues to make API calls to **relative paths** like `/api/status` or `/api/login`.
- The browser sends these requests to `http://localhost:8080/api/...`.
- The Webpack Dev Server (on `8080`) intercepts these requests and **server-side forwards** them to `http://localhost:3000/...`.
- From the browser's perspective, the request never leaves `localhost:8080`, thus **bypassing client-side CORS restrictions** for development.

---

## 4. Running Playwright Tests

Playwright can automatically manage starting your frontend and backend servers using its `webServer` configuration, or you can start them manually as described above.

### Playwright's `webServer` Configuration

Your `playwright/playwright.config.ts` includes a `webServer` section that tells Playwright how to launch and wait for your frontend and backend:

```typescript
// playwright/playwright.config.ts (excerpt)
webServer: [
  {
    command: 'npm run serve', // Start frontend
    url: 'http://localhost:8080', // Wait for frontend to be ready
    cwd: path.resolve(__dirname, '../app/frontend'),
  },
  {
    command: 'npm run dev', // Start backend
    url: 'http://localhost:3000/api/status', // Wait for backend's /api/status endpoint to be ready
    cwd: path.resolve(__dirname, '../app/backend'),
  },
],
```

This configuration ensures both services are running before tests begin.

### Run All Tests

To run all Playwright tests (both UI and API tests):

```bash
# From the 'playwright' directory
cd playwright
npx playwright test
```

### Run UI Tests

To run only the UI-related tests (which interact with the browser and your frontend application):

```bash
# From the 'playwright' directory
cd playwright
npx playwright test --project=chromium-ui
# Or for unauthenticated UI tests (e.g., login):
npx playwright test --project=chromium-ui-unauth
```

### Run API Tests

To run only the pure API tests (which make direct HTTP calls to your backend, bypassing the frontend and browser):

```bash
# From the 'playwright' directory
cd playwright
npx playwright test --project=api-backend
```

### Playwright UI Mode (Interactive Debugging)

For an interactive experience and powerful debugging tools (step-by-step execution, DOM inspection, network logs, screenshots), use the UI mode:

```bash
# From the 'playwright' directory
cd playwright
npx playwright test --ui
```

---

## 5. Production Deployment Notes (Single WAR)

Your final application is designed to be deployed as a **single WAR file** to a servlet container like Apache Tomcat. This fundamentally changes the API communication mechanism compared to development.

- **Integrated Frontend & Backend:** In this setup, your Vue.js static files and your Java API code are bundled together within the same WAR.
- **Same Origin:** When deployed to Tomcat (e.g., at `http://localhost:8080/mywarcontext/`), both your frontend and your Java API endpoints (e.g., `http://localhost:8080/mywarcontext/internal/api/status`) are served from the **exact same origin**.
- **No Proxy Needed:** Because they are on the same origin, the browser's Same-Origin Policy is not violated. Therefore, the `vue.config.js` development proxy is **not included in the production build**, and you **do not need to configure Tomcat as a reverse proxy** for an *external* API. Tomcat simply routes requests internally to the correct Java servlets/controllers within the WAR.
- **API Call Paths:** Ensure your Vue.js application's API calls correctly account for the WAR's context path. If your WAR is `myproject.war` (context `/myproject`), then Vue.js calls should be to `/myproject/internal/api/...`. This can be managed by setting Axios `baseURL` dynamically in your Vue app.

---

## 6. Troubleshooting

- **"Error: Process from config.webServer exited early."**: This almost always means a port conflict. Ensure no other processes are using `localhost:8080` or `localhost:3000`. Close any old terminal windows running servers. Use `netstat -ano | findstr :PORT` (Windows) or `lsof -i :PORT` (macOS/Linux) to identify and kill processes.
- **"Cannot find name 'process'" (TypeScript error)**: Ensure you have installed `@types/node` in your `playwright` directory: `npm install --save-dev @types/node`. Restart your IDE if the error persists.
- **API Test `404 Not Found`**: This means your backend API is running but doesn't have a route defined for the specific path your test is requesting. Double-check the endpoint paths in your Playwright API test (`auth.api.spec.ts`) against your backend's `server.ts` file.
- **Frontend API calls failing in browser (production WAR)**: Check your Tomcat logs (`catalina.out`) for Java backend errors. Verify your Vue.js application is making API calls to the correct URL paths, including the WAR's context path (e.g., `/mywarcontext/internal/api/`).
