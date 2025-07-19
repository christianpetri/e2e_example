// app/frontend/vue.config.js
const { defineConfig } = require("@vue/cli-service");
const dotenv = require("dotenv");
const { DefinePlugin } = require("webpack"); // <--- ADD THIS LINE

// Load environment variables from the root .env file
// Path is relative from vue.config.js: ../../.env (corrected path if vue.config.js is in app/frontend)
// Assuming vue.config.js is in app/frontend, it needs to go up two levels to the root.
dotenv.config({ path: "../../.env" }); // <--- CORRECTED PATH: Should be ../../.env from app/frontend

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: process.env.FRONTEND_PORT || 8080, // Use FRONTEND_PORT from root .env
    proxy: {
      "/api": {
        // Any request to /api from the frontend will be proxied
        target: `http://localhost:${process.env.VUE_APP_BACKEND_PORT || 3000}`, // Use BACKEND_PORT from root .env
        changeOrigin: true,
        // pathRewrite: { '^/api': '' }, // Uncomment if your backend doesn't expect /api prefix
      },
    },
  },

  // --- ADD THIS configureWebpack BLOCK ---
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        // Explicitly define the feature flags Vue expects
        // Setting to 'false' helps with tree-shaking in production builds
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        // You might consider adding others if you see more warnings or want explicit control:
        // __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // Disable devtools support in production
        // __VUE_OPTIONS_API__: JSON.stringify(true), // Set to true if you're using Options API, false if only Composition API
      }),
    ],
  },
  // --- END configureWebpack BLOCK ---
});

module.exports = {
  // This is for your frontend development server settings
  devServer: {
    // Ensure this matches the port your frontend dev server runs on
    port: 8080,
    // The proxy configuration
    proxy: {
      // This rule applies to any request path starting with '/api'
      '/api': {
        // Forward these requests to your backend server
        target: 'http://localhost:3000',
        // This is important for backend servers that use virtual hosting or host headers
        changeOrigin: true,
        // (Optional) If your backend endpoints don't actually include '/api'
        // For example, if you call '/api/status' but the backend is just '/status'
        // then you would use:
        // pathRewrite: { '^/api': '' },
        // In our case, since your backend also uses '/api' (e.g., /api/login),
        // you typically don't need pathRewrite.
      }
    }
  }
};