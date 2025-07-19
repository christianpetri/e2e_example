// app/frontend/src/env.d.ts

// Declaration for process.env variables injected by Vue CLI (Webpack)
declare namespace NodeJS {
  interface ProcessEnv {
    readonly VUE_APP_BASE_URL: string; // Vue CLI often injects this too
    readonly VUE_APP_BACKEND_PORT: string;
    readonly VUE_APP_LOGIN_ENDPOINT: string;
    readonly VUE_APP_PUBLIC_DATA_ENDPOINT: string;
    readonly VUE_APP_PROTECTED_DATA_ENDPOINT: string;
    // Add any other VUE_APP_... environment variables you use in your frontend
    // e.g., readonly VUE_APP_API_KEY: string;
  }
}

// Optional: If you also use 'import.meta.env' somewhere else (e.g., if you were mixing build tools)
// interface ImportMetaEnv {
//   // Define import.meta.env variables here if needed
// }
// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }
