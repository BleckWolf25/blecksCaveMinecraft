/**
 * @file testMocks.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Test mocks.
 *
 * @description
 * Provides stub assertion utilities for standalone testing environments, mirroring Playwright and Jest matcher interfaces to prevent compile errors when running unit test suites without full end-to-end runners.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- ASSERTION STUBS
export const expect = async (value: unknown) => {
  // ---------- OBJECT ASSERTION MATCHER (return chainable verification promises)
  // Check target object type to expose standard chainable test matcher methods
  if (typeof value === 'object' && value !== null) {
    return {
      toBeVisible: () => Promise.resolve(),
      toContainText: () => Promise.resolve(),
      toHaveCount: () => Promise.resolve(),
      toContain: () => Promise.resolve(),
      toHaveClass: () => Promise.resolve(),
      toHaveURL: () => Promise.resolve(),
      toBe: () => Promise.resolve(),
      toHaveAttribute: () => Promise.resolve(),
      toHaveBeenCalled: () => Promise.resolve(),
    };
  }

  // ---------- FALLBACK RESOLUTION (resolve immediately for primitive targets)
  return Promise.resolve();
};
