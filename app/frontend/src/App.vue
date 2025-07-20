<!--
<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>
-->

<template>
  <div id="app">
    <h1>Frontend Application</h1>
    <section class="app-section">
      <h2>Public Data Access</h2>
      <button @click="fetchData" class="action-button">
        Fetch Public Data
      </button>
      <div aria-live="polite">
        <p v-if="data" class="data-message">{{ data }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </section>

    <section class="app-section">
      <h2>User Authentication & Protected Data</h2>
      <div class="login-form" data-testid="login-form">
        <label for="username" class="visually-hidden">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          v-model="username"
          placeholder="Username"
          data-testid="login-username-input"
          autocomplete="username"
        />
        <label for="password" class="visually-hidden">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          v-model="password"
          placeholder="Password"
          data-testid="login-password-input"
          autocomplete="current-password"
        />
        <button
          @click="login"
          data-testid="login-button"
          class="action-button primary-button"
        >
          Login
        </button>
      </div>
      <div aria-live="polite">
        <p
          v-if="loginMessage"
          :style="{
            color: loginSuccess ? 'var(--color-success)' : 'var(--color-error)',
          }"
          class="status-message"
        >
          {{ loginMessage }}
        </p>
      </div>

      <div class="protected-data-controls">
        <button
          @click="fetchProtectedData"
          :disabled="!bearerToken"
          class="action-button"
        >
          Fetch Protected Data (Requires Login)
        </button>
        <div aria-live="polite">
          <p v-if="protectedData" class="data-message">{{ protectedData }}</p>
          <p v-if="protectedError" class="error-message">
            {{ protectedError }}
          </p>
        </div>
      </div>

      <button
        v-if="bearerToken"
        @click="logout"
        data-testid="logout-button"
        class="action-button logout-button"
      >
        Logout
      </button>
    </section>

    <footer class="app-footer-status" aria-live="polite">
      <p class="status-title">Backend Status:</p>
      <p
        v-if="backendStatusMessage"
        :style="{
          color: backendStatusSuccess
            ? 'var(--color-success-muted)'
            : 'var(--color-error-muted)',
        }"
        class="backend-status-message"
      >
        {{ backendStatusMessage }}
      </p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios, { type AxiosError } from "axios";

// Set the base URL for all Axios requests.
// This should match your WAR's context path + your Java API base path.
// Assuming ROOT.war deployment (context path '/') and Java API base path '/internal/api'
axios.defaults.baseURL = "/internal/api";
// If your WAR is named 'myproject.war' (context path '/myproject'), it would be:
// axios.defaults.baseURL = '/myproject/internal/api';

// Define types for clarity
interface BackendDataResponse {
  message: string;
}

interface LoginResponse {
  token: string;
  message: string;
}

interface ProtectedResponse {
  message: string;
  user: string;
}

export default defineComponent({
  name: "App",
  data() {
    return {
      data: null as string | null,
      error: null as string | null,
      username: "" as string,
      password: "" as string,
      // Load token from localStorage on component initialization
      bearerToken:
        localStorage.getItem("bearerToken") || (null as string | null),
      loginMessage: null as string | null,
      loginSuccess: false as boolean,
      protectedData: null as string | null,
      protectedError: null as string | null,
      backendStatusMessage: null as string | null,
      backendStatusSuccess: false as boolean,
    };
  },
  mounted() {
    // Check backend status when the component mounts
    this.checkBackendStatus();
  },
  methods: {
    async fetchData(): Promise<void> {
      this.data = null;
      this.error = null;
      try {
        // Calls /internal/api/public-data (relative to axios.defaults.baseURL)
        const response = await axios.get<BackendDataResponse>("/public-data");
        this.data = response.data.message;
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "Error fetching public data:",
            err.response?.data || err.message
          );
          this.error =
            err.response?.data?.message ||
            "Failed to fetch public data. Network or server issue.";
        } else {
          console.error("An unexpected error occurred:", err);
          this.error = "An unknown error occurred while fetching public data.";
        }
      }
    },
    async login(): Promise<void> {
      this.loginMessage = null;
      this.loginSuccess = false;
      this.bearerToken = null;
      try {
        // Calls /internal/api/login (relative to axios.defaults.baseURL)
        const response = await axios.post<LoginResponse>("/login", {
          username: this.username,
          password: this.password,
        });
        this.bearerToken = response.data.token;
        localStorage.setItem("bearerToken", this.bearerToken || ""); // Store token
        this.loginMessage = response.data.message;
        this.loginSuccess = true;
        console.log("Login successful, token:", this.bearerToken);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Login error:", err.response?.data || err.message);
          this.loginMessage = err.response?.data?.message || "Login failed.";
          this.loginSuccess = false;
        } else {
          console.error("An unexpected error occurred during login:", err);
          this.loginMessage = "An unknown error occurred during login.";
          this.loginSuccess = false;
        }
      }
    },
    async fetchProtectedData(): Promise<void> {
      this.protectedData = null;
      this.protectedError = null;
      if (!this.bearerToken) {
        this.protectedError = "No token available. Please log in first.";
        return;
      }
      try {
        // Calls /internal/api/data (relative to axios.defaults.baseURL)
        const response = await axios.get<ProtectedResponse>("/data", {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
        });
        this.protectedData = response.data.message;
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "Error fetching protected data:",
            err.response?.data || err.message
          );
          this.protectedError =
            err.response?.data?.message ||
            "Failed to fetch protected data. Token might be invalid.";
        } else {
          console.error(
            "An unexpected error occurred during protected data fetch:",
            err
          );
          this.protectedError =
            "An unknown error occurred while fetching protected data.";
        }
      }
    },
    logout(): void {
      this.bearerToken = null;
      localStorage.removeItem("bearerToken");
      this.loginMessage = "Logged out successfully.";
      this.loginSuccess = true;
      this.protectedData = null;
      this.protectedError = null;
      this.username = "";
      this.password = "";
      this.fetchData(); // Refresh public data after logout
      console.log("User logged out.");
    },
    async checkBackendStatus(): Promise<void> {
      this.backendStatusMessage = null;
      this.backendStatusSuccess = false;
      try {
        // Calls /internal/api/status (relative to axios.defaults.baseURL)
        const response = await axios.get<{ message: string }>("/status");
        this.backendStatusMessage = response.data.message;
        this.backendStatusSuccess = true;
        console.log("Backend status:", this.backendStatusMessage);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          this.backendStatusMessage = "Backend is offline or unreachable.";
          this.backendStatusSuccess = false;
          console.error(
            "Error checking backend status:",
            err.response?.data || err.message
          );
        } else {
          this.backendStatusMessage =
            "An unknown error occurred while checking backend status.";
          this.backendStatusSuccess = false;
          console.error(
            "An unexpected error occurred while checking backend status:",
            err
          );
        }
      }
    },
  },
});
</script>

<style>
/* Define CSS Variables for Colors for easier management and consistency */
:root {
  --color-primary: #5a7d7c; /* A calm green-blue */
  --color-primary-dark: #4d6968;
  --color-secondary: #e0f2f1; /* Lighter, almost white, subtle */
  --color-success: #3c914e; /* Accessible green */
  --color-success-muted: #66bb6a; /* Lighter, less prominent green */
  --color-error: #cc3333; /* Accessible red */
  --color-error-muted: #ef5350; /* Lighter, less prominent red */
  --color-text: #333333;
  --color-text-muted: #666666; /* For less prominent text */
  --color-background: #fdfdfd; /* Very light, almost white background */
  --color-card-background: #ffffff;
  --color-border: #eeeeee; /* Very light border color */
}

/* Basic reset for consistent styling */
body {
  margin: 0;
  font-family: "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif; /* A clear, widely available font */
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6; /* Improved readability */
}

#app {
  text-align: center;
  margin-top: 40px;
  max-width: 700px; /* Slightly narrower for focus */
  margin-left: auto;
  margin-right: auto;
  padding: 30px;
  background-color: var(--color-card-background);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); /* Even more subtle shadow */
}

h1 {
  color: var(--color-primary-dark);
  margin-bottom: 40px; /* More space below title */
  font-size: 2.5em; /* Slightly larger title */
  font-weight: 600; /* A bit bolder for title */
}

h2 {
  color: var(--color-primary);
  margin-top: 50px;
  margin-bottom: 30px; /* More space below section titles */
  border-bottom: 1px solid var(--color-border); /* Lighter border */
  padding-bottom: 15px;
  display: inline-block;
  font-size: 1.8em;
  font-weight: 500;
}

/* Main Section Styling */
.app-section {
  background-color: #fcfcfc; /* A very subtle background for sections */
  border: 1px solid var(--color-border); /* Very light border for clear separation */
  border-radius: 10px;
  padding: 35px; /* More padding within sections */
  margin-bottom: 40px; /* More space between sections */
  box-shadow: none; /* No inner shadows */
}

/* Form and controls within sections */
.login-form,
.protected-data-controls {
  margin-top: 30px; /* More top margin */
  margin-bottom: 30px; /* More bottom margin */
  padding: 25px; /* More padding */
  background-color: var(
    --color-secondary
  ); /* Very light, distinct background */
  border-radius: 8px;
  border: none; /* Removed dashed border for cleaner look */
}

/* Visually hidden label for accessibility */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Input and Button Styling */
input {
  width: calc(100% - 28px); /* Account for more padding */
  padding: 14px; /* More padding */
  margin: 12px 0; /* More margin */
  border: 1px solid #d0d0d0; /* Slightly lighter border */
  border-radius: 6px;
  font-size: 17px;
  box-sizing: border-box;
}

input:focus {
  outline: 3px solid var(--color-primary);
  border-color: var(--color-primary);
}

.action-button {
  background-color: var(--color-primary);
  color: white;
  padding: 14px 30px;
  margin: 15px 7px;
  border: none;
  border-radius: 6px;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.2s ease; /* Faster transition */
}

.action-button:hover {
  background-color: var(--color-primary-dark);
}

.action-button:active {
  transform: none; /* Removed subtle transform for more minimalism */
}

.action-button:disabled {
  background-color: #e0e0e0; /* Lighter disabled state */
  color: #a0a0a0;
  cursor: not-allowed;
  opacity: 1; /* Keep opacity at 1 for clarity */
}

.action-button:focus {
  outline: 3px solid var(--color-primary-dark);
  outline-offset: 2px;
}

.primary-button {
  background-color: var(--color-success);
}
.primary-button:hover {
  background-color: #358045;
}
.primary-button:focus {
  outline-color: #358045;
}

.logout-button {
  background-color: var(--color-error);
}
.logout-button:hover {
  background-color: #b32a37;
}
.logout-button:focus {
  outline-color: #b32a37;
}

/* Message Styling */
p {
  font-size: 1.15em;
  margin: 15px 0; /* Increased margin for messages */
  padding: 8px; /* Slightly more padding */
}

.data-message {
  font-weight: 500; /* Less bold */
  color: var(--color-text); /* Use main text color for data */
  background-color: var(--color-secondary); /* Very light background */
  padding: 18px; /* More padding */
  border-radius: 6px;
  border: none; /* Removed border from messages */
}

.status-message {
  font-weight: 500; /* Less bold for generic status messages */
}

.error-message {
  color: var(--color-error);
  font-weight: 500; /* Less bold for errors */
  background-color: #fff0f0; /* Very light red background for errors */
  padding: 12px;
  border-radius: 6px;
}

/* Backend Status Footer Styling (New Section) */
.app-footer-status {
  margin-top: 60px; /* Ample space from content */
  padding: 20px;
  background-color: var(--color-background); /* Matches body background */
  border-top: 1px solid var(--color-border); /* Subtle line above it */
  color: var(--color-text-muted); /* Muted text color */
  font-size: 0.9em; /* Smaller font size */
}

.app-footer-status .status-title {
  font-weight: 600; /* Slightly bold for the "Backend Status:" title */
  margin-bottom: 5px;
  color: var(--color-text); /* Keep title clear */
}

.app-footer-status .backend-status-message {
  font-weight: normal; /* No bolding */
  font-size: 1em; /* Normal size relative to its parent */
  margin: 0; /* Remove default paragraph margin */
  padding: 0; /* Remove default paragraph padding */
}
</style>
