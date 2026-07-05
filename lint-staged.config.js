/**
 * @file lint-staged.config.js
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Lint-staged configuration for pre-commit hooks
 *
 * @description
 * Runs linters and formatters on staged files before commit.
 * Ensures only clean code is committed to the repository.
 *
 * @since 05/07/2026
 * @updated 05/07/2026
 */
// ---------- CONFIGURATION
export default {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.{scss,css}': ['prettier --write'],
};
