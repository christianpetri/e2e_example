# End-to-End Testing Example Project

This project demonstrates a simple full-stack application with a Vue.js frontend and a **Java Spring Boot backend (running in Tomcat via Docker Compose)**, accompanied by a robust End-to-End (E2E) testing suite using Playwright. It's designed to showcase how to set up, run, and test a typical web application from frontend to backend.

## 🚀 Project Overview

The project consists of:

* **`app/frontend`**: A simple Vue.js application that builds into static assets.
* **`app/java-backend-frontend`**: A Java Spring Boot API server, responsible for serving the bundled Vue.js frontend and providing API endpoints. It runs within a Tomcat container via Docker Compose.
* **`playwright`**: The directory containing all Playwright E2E tests and configurations.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine. **It is highly recommended to use a Node Version Manager (NVM) to handle Node.js versions.**

* **Node.js**: Version 14 or higher (LTS recommended).
    * You can download it from [nodejs.org](https://nodejs.org/).
* **npm** (Node Package Manager): Comes bundled with Node.js.
* **Git**: For cloning the repository.
    * You can download it from [git-scm.com](https://www.git-scm.com/).
* **Maven**: Required to build the Java backend project.
    * Download from [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi).
* **Docker Desktop**: Required to run the Java/Tomcat backend using `docker compose`.
    * You can download it from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).

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
git clone https://github.com/christianpetri/e2e_example
cd e2e_example
```

### 2. Configure Environment Variables (`.env` file)

Environment variables are crucial for configuring different parts of the application and tests.

Create a file named `.env` in the **root directory** of your project (`e2e_example/.env`).

**File: `e2e_example/.env`**

```dotenv
# .env

# Frontend URL (for Playwright and general reference)
# IMPORTANT: This MUST end with a trailing slash!
FRONTEND_BASE_URL=http://localhost:8080/

# Backend API URL (for Playwright API tests and general reference)
# Note: In single WAR deployment, this is effectively the same host/port as FRONTEND_BASE_URL
# but the path within the WAR is distinct.

# New variable for the base path of the Java API within the WAR
# IMPORTANT: This MUST NOT start with a slash, but MUST end with a trailing slash!
JAVA_API_BASE_PATH=internal/api/

# Test Credentials (used by Playwright tests and backend for demo login)
TEST_USERNAME=testuser
TEST_PASSWORD=testpassword

# Playwright Debugging Flags (set to 'true' for verbose output/tracing)
DEBUG_PLAYWRIGHT_CONFIG=false
PLAYWRIGHT_TRACE=false
```

### 3. Install Playwright Dependencies

Navigate to the `playwright` directory and install its dependencies.

```bash
cd playwright
npm install
npx playwright install # Installs Playwright browsers
```

## 🚀 Building and Deploying the Application

The application's frontend (Vue.js) is built, then bundled into the Java backend (Maven) project, which then creates a `ROOT.war` file. This WAR is deployed to a Tomcat container managed by Docker Compose.

Convenient scripts are provided at the project root to automate this process.

**Make scripts executable (Linux/macOS only):**
```bash
# From project root
chmod +x deploy-to-docker.sh docker-down.sh
```

**To build and deploy the entire application (Frontend + Java Backend + Docker):**

This script will:
1.  Check if Docker is running.
2.  (Optional) Check if `nvm` is sourced.
3.  Navigate to `app/frontend`, run `npm install` and `npm run build`.
4.  Navigate to `app/java-backend-frontend`, run `mvn clean install` (which bundles the Vue.js build into `ROOT.war`).
5.  Stop any existing Docker containers (`docker compose down --remove-orphans`).
6.  Start the Tomcat container (`docker compose up -d tomcat`).
7.  Wait briefly for Tomcat to start.
8.  Copy the `ROOT.war` into the running Tomcat container.

* **Linux/macOS:**
    ```bash
    # From project root
    ./deploy-to-docker.sh
    ```
* **Windows:**
    ```cmd
    :: From project root
    deploy-to-docker.bat
    ```

### Verify Application Availability (Port 8080)

After running the deployment script, wait a few moments for the Tomcat server to fully start up and deploy the WAR. You can verify its availability by accessing a known public endpoint.

Open your web browser or use `curl`:

```bash
curl http://localhost:8080/internal/api/public-data
```

**Expected Output:** You should see a JSON response similar to `{"message":"This is public data from the Java backend!"}`.
If you get a connection refused or a different error, wait a bit longer or check your Docker logs for issues (`docker logs -f my-tomcat-app`).

## 🧪 End-to-End Testing with Playwright

This project uses Playwright for robust E2E testing. The tests are configured to automatically manage your application servers (if not already running) and perform comprehensive tests.

### How Playwright Works Here

* **Automatic Server Management (`webServer`):** In `playwright/playwright.config.ts`, the `webServer` section is configured to run the `deploy-to-docker.sh` (or `.bat`) script before tests begin. This ensures your entire application stack (frontend and Java backend) is built, deployed, and ready. It also includes a health check to wait until the application is responsive. You do **not** need to run `deploy-to-docker` manually when running tests via Playwright's `webServer`.
* **Global Setup (`globalSetup`):** The `playwright/auth.setup.ts` script runs once before all tests. It performs a UI login and saves the authenticated session state (`storageState.json`).
* **Authentication Reuse:**
    * **UI Tests (`chromium-ui` project):** Reuse the `storageState.json` to start tests with an already logged-in user, avoiding repeated UI login steps.
    * **API Tests (`api-backend` project):** The tests can directly leverage the `storageState` from the global setup, ensuring that API calls within these tests are authenticated where necessary. Some tests might also perform explicit API logins to test authentication flows directly.

### Running Tests

Navigate to the `playwright` directory:

```bash
cd playwright
npx playwright test
```

#### Run All Tests

```bash
cd playwright
npx playwright test
```

#### Run UI Tests Only

```bash
cd playwright
npx playwright test --project=chromium-ui
```

#### Run API Tests Only

```bash
cd playwright
npx playwright test --project=api-backend
```

#### Run a Specific Test File

```bash
cd playwright
npx playwright test tests/api/auth.api.spec.ts
```

### Stopping Docker Containers

When you're done with development or testing, you can stop and remove the Docker containers using the provided script:

* **Linux/macOS:**
    ```bash
    # From project root
    ./docker-down.sh
    ```
* **Windows:**
    ```cmd
    :: From project root
    docker-down.bat
    ```

### Viewing Test Reports

After running tests, Playwright automatically generates an HTML report.

```bash
cd playwright
npx playwright show-report
```

### Debugging Playwright Configuration

If you need to debug how Playwright is loading environment variables or configuring its base URLs, you can enable verbose logging for the configuration:

* **On Windows (PowerShell):**

    ```bash
    $env:DEBUG_PLAYWRIGHT_CONFIG='true'; npx playwright test --prefix playwright
    ```

* **On Windows (Command Prompt - CMD):**

    ```bash
    set DEBUG_PLAYWRIGHT_CONFIG=true && npx playwright test --prefix playwright
    ```

* **On Linux/macOS:**

    ```bash
    DEBUG_PLAYWRIGHT_CONFIG=true npx playwright test --prefix playwright
    ```

    Remember to remove the `DEBUG_PLAYWRIGHT_CONFIG=true` prefix for normal test runs to keep the output clean.

## 📂 Project Structure

```text
e2e_example/
├── .env                            # Environment variables for backend, frontend, and Playwright
├── README.md                       # This file
├── docker-compose.yml              # Docker Compose configuration for Tomcat container
├── deploy-to-docker.sh             # Script to build & deploy app (Linux/macOS)
├── deploy-to-docker.bat            # Script to build & deploy app (Windows)
├── docker-down.sh                  # Script to stop Docker containers (Linux/macOS)
├── docker-down.bat                 # Script to stop Docker containers (Windows)
├── app/
│   ├── java-backend-frontend/      # Java Spring Boot backend application (bundles frontend)
│   │   ├── src/
│   │   │   └── main/java/.../server/ # Backend Java source
│   │   │       └── YourApplication.java # Main Spring Boot class
│   │   │       └── controller/ # Your API controllers (e.g., DataController, AuthController)
│   │   ├── pom.xml                 # Maven build file
│   │   └── Dockerfile              # Dockerfile for the Tomcat container (minimal, as WAR is copied)
│   └── frontend/                   # Vue.js frontend application (built into static assets)
│       ├── public/
│       ├── src/
│       │   └── App.vue             # Main Vue component (modified for data-testid, id, name)
│       └── package.json            # Frontend-specific package.json
└── playwright/                     # Playwright E2E testing setup
    ├── auth/                       # Directory for generated authentication state
    │   └── storageState.json       # Generated file storing authenticated session state
    ├── auth.setup.ts               # Global setup for UI login authentication
    ├── playwright.config.ts        # Playwright configuration file
    ├── tests/
    │   ├── api/
    │   │   └── auth.api.spec.ts    # API tests for authentication and protected resources
    │   └── ui/
    │       ├── basic.ui.spec.ts    # Basic UI tests (e.g., navigation, public data)
    │       └── login.ui.spec.ts    # UI test for login functionality
    └── package.json                # Playwright-specific package.json
```
