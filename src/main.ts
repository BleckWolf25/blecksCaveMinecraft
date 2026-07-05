/**
 * @file main.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Entry point for the application.
 *
 * @description
 * Serves as the primary execution entry point for the client application, establishing global error handling interceptors, and initializing the URL-based navigation router.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { initRouter } from './router.ts';
import { initGlobalErrorHandling } from './utils/errorHandler.ts';

// ---------- INITIALIZATION
// Attach top-level exception listeners before mounting application components to catch startup crashes
initGlobalErrorHandling();

// TV detection
const isTV = /smart-tv|smarttv|googletv|appletv|hbbtv|netcast|opera.tv|webos|playstation|xbox|nintendo/i.test(
  navigator.userAgent
);
if (isTV) {
  document.body.classList.add('device-tv');
}

// Mount navigation routing logic and render the initial URL view
initRouter();
