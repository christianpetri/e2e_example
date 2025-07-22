// .eslintrc.js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "playwright"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:playwright/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    browser: true,
    node: true,
    "playwright/playwright": true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
};
