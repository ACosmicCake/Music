// ESLint: the recommended rules only, to catch real mistakes (undefined names, unreachable code,
// duplicate keys, duplicate switch cases), not to enforce a style. Run with `npm run lint`.
// Unused names are warnings, not errors: a spare import is untidy but harmless, and an unused
// `catch (e)` is how this code says "ignore this error" (as eslint:recommended treated it before v9).
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'android/', 'dev-dist/', 'node_modules/'] },
  js.configs.recommended,
  { rules: { 'no-unused-vars': ['warn', { caughtErrors: 'none' }] } },
  { files: ['src/**/*.js'], languageOptions: { globals: { ...globals.browser } } },
  { files: ['scripts/**/*.{js,mjs}', 'vite.config.js', 'eslint.config.js'], languageOptions: { globals: { ...globals.node } } },
  { files: ['test/**/*.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } } }
];
