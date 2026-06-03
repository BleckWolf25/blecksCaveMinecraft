/**
 * @file eslint.config.js
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Flat ESLint configuration prioritizing security, performance, and TS type-checking.
 * 
 * @description Integrates Prettier to avoid formatting conflicts and uses standard globals
 * rather than hardcoded environment variables.
 * 
 * @since 01/06/2026
 * @updated 03/06/2026
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // 1. Inherit core JS and type-aware TS configurations
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      // DRY: Utilize standard definitions over hardcoded magic strings
      globals: {
        ...globals.browser,
        ...globals.node, // Needed for Vite/Vitest config files
      }
    },
    rules: {
      // 2. Strict Logic, Security, and Code Quality Rules
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      '@typescript-eslint/no-unused-vars': ['error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': false }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      
      // Enforce explicit return types for better documentation and self-documenting code
      '@typescript-eslint/explicit-function-return-type': 'warn'
    }
  },
  
  // 3. Must remain last: disables all ESLint rules that conflict with Prettier
  prettierConfig
);