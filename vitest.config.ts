/**
 * @file vitest.config.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Vitest unit testing framework configuration.
 *
 * @description
 * Configures Vitest for unit test execution in a simulated DOM environment using jsdom, setting up global assertion variables, test environment bootstrap scripts, and file exclusion rules.
 *
 * @since 25/06/2026
 * @updated 05/07/2026
 */
// ---------- IMPORTS
import { defineConfig } from 'vitest/config';

// ---------- CONFIGURATION
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
