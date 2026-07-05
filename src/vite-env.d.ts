/**
 * @file vite-env.d.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Vite environment and experimental DOM type declarations.
 *
 * @description
 * Declares Vite client references for static asset imports and environment variables, and extends the native browser Document interface with experimental View Transitions API signatures.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- VITE CLIENT REFERENCES
/// <reference types="vite/client" />

// ---------- EXPERIMENTAL DOM TYPE DEFINITIONS
interface Document {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition: () => void;
  };
}
