/* eslint-env node */

// Deliberately close to the stock Vite React config. The value here is catching real
// mistakes — unused variables, missing effect dependencies, invalid hook calls — not
// enforcing a house style, so nothing stylistic is switched on.
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", "node_modules", "*.cjs"],
  rules: {
    // The project does not use PropTypes and is not TypeScript; requiring them would
    // produce hundreds of findings that say nothing about correctness.
    "react/prop-types": "off",
    // react-three-fiber's JSX elements (<mesh>, <icosahedronGeometry>, …) are resolved
    // by fiber's reconciler at runtime, so this rule cannot see them.
    "react/no-unknown-property": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  },
};
