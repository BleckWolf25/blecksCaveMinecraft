/**
 * @file errorHandler.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Global error management and UI exception presentation overlay.
 *
 * @description
 * Centralizes runtime exception and unhandled promise rejection capturing, managing state for global error tracking and rendering responsive modal dialog overlays with stack trace inspection and page recovery options.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- INTERFACES & TYPE DEFINITIONS
interface ErrorState {
  hasError: boolean;
  message: string;
  details?: string | undefined;
}

// ---------- MODULE STATE VARIABLES
let errorState: ErrorState = {
  hasError: false,
  message: '',
};

let errorOverlay: HTMLElement | null = null;

// ---------- GLOBAL ERROR LISTENER SETUP
/**
 * Initialize global error handlers
 */
export function initGlobalErrorHandling(): void {
  // ---------- UNHANDLED EXCEPTION HANDLER
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    showError('An unexpected error occurred', event.error?.message || 'Unknown error');
  });

  // ---------- UNHANDLED PROMISE REJECTION HANDLER
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An asynchronous operation failed', event.reason?.message || 'Unknown error');
  });
}

// ---------- ERROR OVERLAY RENDERING
/**
 * Show error UI to the user
 */
function showError(message: string, details?: string): void {
  errorState = {
    hasError: true,
    message,
    details,
  };

  // ---------- GUARD CLAUSE & DOM INJECTION (create overlay container if unmounted)
  if (!errorOverlay) {
    errorOverlay = document.createElement('div');
    errorOverlay.id = 'global-error-overlay';
    errorOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 2rem;
    `;
    document.body.appendChild(errorOverlay);
  }

  // ---------- OVERLAY CONTENT COMPILATION (populate modal dialog with error details and recovery controls)
  errorOverlay.innerHTML = `
    <div style="
      background: hsl(var(--surface));
      border: 1px solid hsl(var(--border));
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    ">
      <div style="
        width: 64px;
        height: 64px;
        margin: 0 auto 1.5rem;
        background: hsl(var(--primary), 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 style="
        color: hsl(var(--primary-text));
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
      ">Something went wrong</h2>
      <p style="
        color: hsl(var(--secondary-text));
        margin: 0 0 1.5rem 0;
        line-height: 1.6;
      ">${message}</p>
      ${
        details
          ? `
        <details style="
          margin-bottom: 1.5rem;
          text-align: left;
        ">
          <summary style="
            color: hsl(var(--secondary-text));
            cursor: pointer;
            padding: 0.5rem;
            background: hsla(var(--border), 0.3);
            border-radius: 4px;
          ">Error details</summary>
          <pre style="
            margin: 0.5rem 0 0 0;
            padding: 1rem;
            background: hsla(var(--border), 0.2);
            border-radius: 4px;
            overflow: auto;
            font-size: 0.85rem;
            color: hsl(var(--secondary-text));
          ">${escapeHtml(details)}</pre>
        </details>
      `
          : ''
      }
      <button onclick="window.location.reload()" style="
        background: hsl(var(--primary));
        color: hsl(var(--primary-bg));
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        Reload Page
      </button>
    </div>
  `;
}

// ---------- ERROR STATE MANAGEMENT
/**
 * Clear error state and hide error overlay
 */
export function clearError(): void {
  errorState = {
    hasError: false,
    message: '',
  };
  // ---------- GUARD CLAUSE (remove overlay from DOM when present)
  if (!errorOverlay) {
    return;
  }
  errorOverlay.remove();
  errorOverlay = null;
}

/**
 * Get current error state
 */
export function getErrorState(): ErrorState {
  return { ...errorState };
}

// ---------- STRING SANITIZATION HELPERS
/**
 * Escape HTML to prevent XSS in error messages
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- ASYNC OPERATION WRAPPERS
/**
 * Async error wrapper for better error handling in async operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    showError(errorMessage, error instanceof Error ? error.message : String(error));
    return null;
  }
}
