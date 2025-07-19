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
