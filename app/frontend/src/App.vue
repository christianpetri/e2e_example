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
    <h1>Frontend App</h1>
    <button @click="fetchData">Fetch Public Data</button>
    <p v-if="data">{{ data }}</p>
    <p v-if="error" style="color: red">Error: {{ error }}</p>

    <h2>Login and Protected Data</h2>
    <div data-testid="login-form">
      <input
        type="text"
        id="username"
        name="username"
        v-model="username"
        placeholder="Username"
        data-testid="login-username-input"
        autocomplete="username"
      />
      <input
        type="password"
        id="password"
        name="password"
        v-model="password"
        placeholder="Password"
        data-testid="login-password-input"
        autocomplete="current-password"
      />
      <button @click="login" data-testid="login-button">Login</button>
    </div>
    <p v-if="loginMessage" :style="{ color: loginSuccess ? 'green' : 'red' }">
      {{ loginMessage }}
    </p>

    <button @click="fetchProtectedData" :disabled="!bearerToken">
      Fetch Protected Data (Requires Login)
    </button>
    <p v-if="protectedData">{{ protectedData }}</p>
    <p v-if="protectedError" style="color: red">Error: {{ protectedError }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

// Define types for clarity
interface BackendDataResponse {
  message: string;
  timestamp: string; // Assuming timestamp is a string from backend
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
      bearerToken: null as string | null,
      loginMessage: null as string | null,
      loginSuccess: false as boolean,
      protectedData: null as string | null,
      protectedError: null as string | null,
    };
  },
  methods: {
    async fetchData(): Promise<void> {
      this.data = null;
      this.error = null;
      try {
        const response = await axios.get<BackendDataResponse>("/api/data");
        this.data = response.data.message;
      } catch (err: any) {
        console.error("Error fetching data:", err);
        this.error = "Failed to fetch public data. Check console for issues.";
      }
    },
    async login(): Promise<void> {
      this.loginMessage = null;
      this.loginSuccess = false;
      this.bearerToken = null;
      try {
        const response = await axios.post<LoginResponse>(
          process.env.VUE_APP_LOGIN_ENDPOINT || "/api/login",
          {
            username: this.username,
            password: this.password,
          }
        );
        this.bearerToken = response.data.token;
        this.loginMessage = response.data.message;
        this.loginSuccess = true;
        console.log("Login successful, token:", this.bearerToken);
      } catch (err: any) {
        console.error("Login error:", err);
        this.loginMessage = err.response?.data?.message || "Login failed.";
        this.loginSuccess = false;
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
        const response = await axios.get<ProtectedResponse>("/api/protected", {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
        });
        this.protectedData = response.data.message;
      } catch (err: any) {
        console.error("Error fetching protected data:", err);
        this.protectedError =
          err.response?.data?.message ||
          "Failed to fetch protected data. Token might be invalid.";
      }
    },
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

input {
  margin: 5px;
  padding: 8px;
  font-size: 16px;
}
</style>
