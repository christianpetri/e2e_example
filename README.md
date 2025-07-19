# End-to-End Testing Example Project

This project demonstrates a simple full-stack application with a Vue.js frontend and an Express.js backend, accompanied by a robust End-to-End (E2E) testing suite using Playwright. It's designed to showcase how to set up, run, and test a typical web application from frontend to backend.

## 🚀 Project Overview

The project consists of:

* **`app/frontend`**: A simple Vue.js application that interacts with the backend.
* **`app/backend`**: An Express.js API server that provides data and authentication endpoints.
* **`playwright`**: The directory containing all Playwright E2E tests and configurations.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine. **It is highly recommended to use a Node Version Manager (NVM) to handle Node.js versions.**

* **Node.js**: Version 14 or higher (LTS recommended).
  * You can download it from [nodejs.org](https://nodejs.org/).
* **npm** (Node Package Manager): Comes bundled with Node.js.
* **Git**: For cloning the repository.
  * You can download it from [git-scm.com](https://git-scm.com/).

### Node Version Manager (NVM) - Highly Recommended

`nvm` (Node Version Manager) allows you to easily install and switch between different Node.js versions on your machine. This is crucial for collaborative projects to ensure everyone is using the exact same Node.js version required by the project, preventing "it works on my machine" issues.

**Installation:**

* **Linux/macOS:** Follow the instructions on the [nvm GitHub repository](https://github.com/nvm-sh/nvm#installing-and-updating). Typically, you'll use a `curl` or `wget` command.
* **Windows:** Use `nvm-windows`. You can find instructions and releases on its [GitHub repository](https://github.com/coreybutler/nvm-windows#installation).

**Basic Usage:**

After installing `nvm`, you can:

* **Install a specific Node.js version:**

    ```bash
    nvm install 18 # Or the specific version recommended for the project
    ```

* **Use a specific Node.js version for your current terminal session:**

    ```bash
    nvm use 18 # Use the version you installed
    ```

* **Set a default Node.js version:**

    ```bash
    nvm alias default 18
    ```

* **See all installed Node.js versions:**

    ```bash
    nvm ls
    ```

## 🛠️ Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd e2e_example
```

### 2. Install Dependencies

Navigate into each application directory and install their respective dependencies.

```bash
# Install backend dependencies
cd app/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Playwright dependencies
cd ../../playwright
npx playwright install # Installs Playwright browsers
npm install
```

### 3. Configure Environment Variables (`.env` file)

Environment variables are crucial for configuring different parts of the application and tests.

Create a file named `.env` in the **root directory** of your project (e.g., `e2e_example/.env`).

**File: `e2e_example/.env`**

```dotenv
# .env

# --- Backend Configuration ---
# Port where the Express.js backend will listen
BACKEND_PORT=3000
# Username and password for backend API authentication
API_USERNAME=testuser
API_PASSWORD=testpassword

# --- Frontend Configuration ---
# Port where the Vue.js frontend will be served
FRONTEND_PORT=8080
# The backend port, prefixed with VUE_APP_ for Vue CLI to expose it to the frontend
VUE_APP_BACKEND_PORT=3000
# Frontend login endpoint relative to its proxy setup
VUE_APP_LOGIN_ENDPOINT=/api/login

# --- Playwright Configuration ---
# Base URL for UI tests (will be http://localhost:8080)
BASE_URL=http://localhost:8080
# BACKEND_API_URL for direct API tests (will be http://localhost:3000)
BACKEND_API_URL=http://localhost:3000

# --- Playwright Test User Credentials ---
# These are used by the Playwright API tests for authentication
TEST_USERNAME=testuser
TEST_PASSWORD=testpassword
```

## 🚀 Running the Applications

You can run the frontend and backend applications manually in separate terminal windows. This is often useful for development.

### 1. Start the Backend Server

Open a new terminal, navigate to the `app/backend` directory, and run:

```bash
cd app/backend
npm run dev
```

You should see output indicating the backend is listening on `http://localhost:3000`.

### 2. Start the Frontend Application

Open another new terminal, navigate to the `app/frontend` directory, and run:

```bash
cd app/frontend
npm run serve
```

You should see output indicating the frontend is served on `http://localhost:8080`.

You can now visit `http://localhost:8080` in your web browser to interact with the application.

## 🧪 End-to-End Testing with Playwright

This project uses Playwright for robust E2E testing. The tests are configured to automatically start your frontend and backend servers, perform authentication, and run various UI and API tests.

### How Playwright Works Here

* **Automatic Server Management (`webServer`):** In `playwright/playwright.config.ts`, the `webServer` section tells Playwright to automatically start your `app/frontend` and `app/backend` servers before tests run, and shut them down afterwards. You do **not** need to run them manually when running tests via Playwright's `webServer`.
* **Global Setup (`globalSetup`):** The `playwright/auth.setup.ts` script runs once before all tests. It performs a UI login and saves the authenticated session state (`storageState.json`).
* **Authentication Reuse:**
  * **UI Tests (`chromium-ui` project):** Reuse the `storageState.json` to start tests with an already logged-in user, avoiding repeated UI login steps.
  * **API Tests (`api-backend` project):** Perform an explicit API login within each test (or a `test.beforeEach`) to obtain a fresh token, ensuring isolated and clear API authentication flow for testing.

### Running Tests

Navigate to the `playwright` directory:

```bash
cd playwright
```

#### Run All Tests

```bash
npx playwright test
```

#### Run UI Tests Only

```bash
npx playwright test --project=chromium-ui
```

#### Run API Tests Only

```bash
npx playwright test --project=api-backend
```

#### Run a Specific Test File

```bash
npx playwright test tests/api/auth.api.spec.ts
```

### Viewing Test Reports

After running tests, Playwright automatically generates an HTML report.

```bash
npx playwright show-report
```

### Debugging Playwright Configuration

If you need to debug how Playwright is loading environment variables or configuring its base URLs, you can enable verbose logging for the configuration:

* **On Windows (PowerShell):**

    ```bash
    $env:DEBUG_PLAYWRIGHT_CONFIG='true'; npx playwright test
    ```

* **On Windows (Command Prompt - CMD):**
´´´bash

´´´
    ```bash
    set DEBUG_PLAYWRIGHT_CONFIG=true && npx playwright test
    ```

* **On Linux/macOS:**

    ```bash
    DEBUG_PLAYWRIGHT_CONFIG=true npx playwright test
    ```

    Remember to remove the `DEBUG_PLAYWRIGHT_CONFIG=true` prefix for normal test runs to keep the output clean.

## 📂 Project Structure

```text
e2e_example/
├── .env                       # Environment variables for backend, frontend, and Playwright
├── README.md                  # This file
├── app/
│   ├── backend/               # Express.js backend application
│   │   ├── src/
│   │   │   └── server.ts      # Backend API definitions
│   │   └── package.json
│   └── frontend/              # Vue.js frontend application
│       ├── public/
│       ├── src/
│       │   └── App.vue        # Main Vue component (modified for data-testid, id, name)
│       └── package.json       # (Modified vue.config.js for feature flags, .env path, etc.)
└── playwright/                # Playwright E2E testing setup
    ├── .env.example           # Example .env for Playwright (not actively used if root .env exists)
    ├── auth.setup.ts          # Global setup for UI login authentication
    ├── playwright.config.ts   # Playwright configuration file (modified for new project type)
    ├── storageState.json      # Generated file storing authenticated session state
    ├── tests/
    │   ├── api/
    │   │   └── auth.api.spec.ts # API tests for authentication and protected resources
    │   └── ui/
    │       ├── basic.ui.spec.ts # Basic UI tests (e.g., navigation, public data)
    │       └── login.ui.spec.ts # UI test for login functionality (new file, modified assertions)
    └── package.json
```
