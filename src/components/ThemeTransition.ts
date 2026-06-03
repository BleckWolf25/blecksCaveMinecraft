/**
 * Initializes and triggers a full-screen transition wipe before executing a state transition.
 * @param {() => void} stateChangeCallback - The callback that switches the DOM contents and theme.
 */
export function triggerThemeTransition(stateChangeCallback: () => void): void {
  let overlay = document.getElementById('theme-wipe-overlay') as HTMLElement | null;

  // Create overlay element if it doesn't exist
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'theme-wipe-overlay';
    overlay.className = 'theme-transition-overlay';
    document.body.appendChild(overlay);
  }

  // 1. Reset overlay states
  overlay.classList.remove('active', 'fade-out');

  // 2. Force reflow
  void overlay.offsetHeight;

  // 3. Slide the wipe up (covers the viewport)
  overlay.classList.add('active');

  // 4. When the wipe fully covers the screen, change the state
  setTimeout(() => {
    stateChangeCallback();

    // 5. Force reflow again to ensure the new styles/DOM take effect
    if (overlay) {
      void overlay.offsetHeight;

      // 6. Slide the wipe down (revealing the new theme/content)
      overlay.classList.add('fade-out');
      overlay.classList.remove('active');

      // 7. Clean up states after transition completes
      setTimeout(() => {
        if (overlay) {
          overlay.classList.remove('fade-out');
        }
      }, 600); // Matches CSS transition duration
    }
  }, 300); // Midpoint of transition where screen is fully covered
}
