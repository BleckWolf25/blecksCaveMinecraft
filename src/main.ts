import { applyTheme, switchTheme } from './theme.ts';
import { globalPortalTheme, modpacks } from './wiki-data.ts';
import { renderPortal } from './components/Portal.ts';
import { renderNavigation } from './components/Navigation.ts';
import { renderWikiView } from './components/WikiView.ts';
import { triggerThemeTransition } from './components/ThemeTransition.ts';
import { initSearchModal } from './components/SearchModal.ts';
import { CleanupCallback } from './types.ts';

// Global reference elements
const appContainer = document.getElementById('app') as HTMLElement;
let activeCleanup: CleanupCallback | null = null; // Stores cleanup callbacks from active views

/**
 * Directs the app router to the specified path hash.
 * @param {string} routeHash - The URL hash route (e.g. '#/velocita-optimized/features')
 * @param {boolean} isInitialLoad - True if this is the first page render.
 */
function handleRouting(routeHash: string, isInitialLoad = false): void {
  if (!appContainer) {return;}

  // Clean up current active view listeners to prevent memory leaks
  if (activeCleanup && typeof activeCleanup === 'function') {
    activeCleanup();
    activeCleanup = null;
  }

  // Parse path (e.g., #/velocita-optimized/overview -> ['velocita-optimized', 'overview'])
  const pathParts = routeHash.replace(/^#\/?/, '').split('/');
  const modpackId = pathParts[0];
  const pageId = pathParts[1] || 'overview';

  // State Transition logic
  const performStateChange = () => {
    if (modpackId && modpacks[modpackId]) {
      // 1. Swap theme stylesheet and classes to the selected modpack
      switchTheme(modpackId);

      // 2. Render Sticky Navigation Header
      renderNavigation(
        document.body,
        modpackId,
        () => navigateTo('#/'), // Back to portal
        (id) => navigateTo(`#/${id}/overview`) // Switch modpack dropdown
      );

      // 3. Render split panel Wiki View
      renderWikiView(appContainer, modpackId, pageId);
    } else {
      // Clear Navigation if returning to portal
      const nav = document.body.querySelector('.nav-bar');
      if (nav) { nav.remove(); }

      // Clear any custom event handlers attached to navigation container
      const navSwitcher = document.body.querySelector('.nav-switcher-container') as HTMLElement & { cleanup?: () => void } | null;
      if (navSwitcher && typeof navSwitcher.cleanup === 'function') {
        navSwitcher.cleanup();
      }

      // 1. Reset theme to central portal defaults
      applyTheme(globalPortalTheme);

      // 2. Render immersive landing portal
      activeCleanup = renderPortal(appContainer, (id) => {
        navigateTo(`#/${id}/overview`);
      });
    }
  };

  // If this is the first load, execute instantly without transition overlays.
  if (isInitialLoad) {
    performStateChange();
  } else {
    // Attempt to use modern native View Transitions API first
    const anyDoc = document as unknown as { startViewTransition?: (cb: () => void) => void };
    if (anyDoc.startViewTransition) {
      anyDoc.startViewTransition(() => {
        performStateChange();
      });
    } else {
      // Fallback to custom liquid wipe screen transition
      triggerThemeTransition(performStateChange);
    }
  }
}

/**
 * Handles smooth dynamic redirection, updating hash states.
 * @param {string} targetHash - The destination hash.
 */
function navigateTo(targetHash: string): void {
  if (window.location.hash === targetHash) {
    // If the hash is already the target, manually trigger router
    handleRouting(targetHash);
  } else {
    window.location.hash = targetHash;
  }
}

// ==========================================================================
// Initializer & Event Listeners
// ==========================================================================

// Listen for browser backward/forward and anchor hash changes
window.addEventListener('hashchange', () => {
  handleRouting(window.location.hash);
});

// Run initial load router when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Search Modal
  initSearchModal((packId, pageId) => {
    navigateTo(`#/${packId}/${pageId}`);
  });

  handleRouting(window.location.hash || '#/', true);
});
