/**
 * @file ThemeTransition.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Full-screen visual wipe animation for theme transitions.
 *
 * @description
 * Generates and orchestrates a CSS-driven full-screen liquid wipe overlay during major view transitions and project switches, masking DOM mutations and color palette re-computations to deliver a seamless user experience.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- TRANSITION OVERLAY ENGINE
/**
 * Initializes and triggers a full-screen transition wipe before executing a state transition.
 * @param {() => void} stateChangeCallback - The callback that switches the DOM contents and theme.
 */
export function triggerThemeTransition(stateChangeCallback: () => void): void {
  // ---------- GUARD CLAUSE (verify callback function is provided)
  if (!stateChangeCallback) {
    return;
  }

  // ---------- OVERLAY RESOLUTION (retrieve or mount persistent wipe container)
  let overlay = document.getElementById('theme-wipe-overlay');

  // Create overlay element if it does not yet exist in DOM
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'theme-wipe-overlay';
    overlay.className = 'theme-transition-overlay';
    document.body.appendChild(overlay);
  }

  // ---------- TRANSITION ACTIVATION (reset animation classes and trigger viewport coverage)
  // Reset prior animation state classes before launching wipe sequence
  overlay.classList.remove('active', 'fade-out');

  // Force synchronous layout reflow to ensure CSS animation restarts cleanly
  void overlay.offsetHeight;

  // Trigger upward sliding mask that covers the entire browser viewport
  overlay.classList.add('active');

  // ---------- STATE MUTATION (execute DOM callback when screen is fully masked)
  // Wait until overlay reaches midpoint coverage before executing DOM changes
  setTimeout(() => {
    stateChangeCallback();

    // ---------- REVEAL & TEARDOWN (slide wipe away and clean up animation state)
    if (overlay) {
      // Force second layout reflow so newly rendered DOM elements take effect
      void overlay.offsetHeight;

      // Trigger downward reveal animation to unveil updated view and theme
      overlay.classList.add('fade-out');
      overlay.classList.remove('active');

      // Clean up animation classes once transition completes
      setTimeout(() => {
        if (overlay) {
          overlay.classList.remove('fade-out');
        }
      }, 600);
    }
  }, 300);
}
