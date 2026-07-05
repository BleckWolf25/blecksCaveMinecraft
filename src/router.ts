/**
 * @file router.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Router for handling application navigation.
 *
 * @description
 * Manages URL path resolution and view rendering for the application, handling cleanup of previous view event listeners, coordinating theme stylesheet swaps, and orchestrating smooth page transitions via the View Transitions API or custom wipe effects.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { applyTheme, switchTheme } from './theme.ts';
import { globalPortalTheme, modpacks } from './wiki-data.ts';
import { renderPortal } from './components/Portal.ts';
import { renderNavigation } from './components/Navigation.ts';
import { renderWikiView } from './components/WikiView.ts';
import { triggerThemeTransition } from './components/ThemeTransition.ts';
import { initSearchModal } from './components/SearchModal.ts';
import { CleanupCallback } from './types.ts';

// ---------- DOM REFERENCES & MODULE STATE
// Cache root mounting element to avoid DOM querying on every route change
const appContainer = document.getElementById('app') as HTMLElement;
// Retain cleanup callback from active view to teardown event listeners on navigation
let activeCleanup: CleanupCallback | null = null;

// ---------- ROUTE RESOLUTION & VIEW RENDERING
/**
 * Directs the app router to the specified path.
 * @param {string} pathname - The URL pathname (e.g. '/velocita-optimized/features')
 * @param {boolean} isInitialLoad - True if this is the first page render.
 */
export function handleRouting(pathname: string, isInitialLoad = false): void {
  // ---------- GUARD CLAUSE (verify mount target exists)
  if (!appContainer) {
    return;
  }

  // ---------- TEARDOWN (destroy prior view handlers)
  // Invoke active view cleanup before DOM replacement to prevent memory leaks and zombie listeners
  if (activeCleanup && typeof activeCleanup === 'function') {
    activeCleanup();
    activeCleanup = null;
  }

  // ---------- PATH PARSING (extract project and page identifiers)
  // Strip leading slash and split URL into modpack ID and document page ID
  const pathParts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const modpackId = pathParts[0];
  const pageId = pathParts[1] || 'overview';

  // ---------- VIEW RENDERING (swap theme and mount active components)
  const performStateChange = () => {
    if (modpackId && modpacks[modpackId]) {
      const pack = modpacks[modpackId];
      const page = pack.pages[pageId];
      if (page) {
        document.title = `${page.title} | ${pack.title} | Bleck's Cave`;
      } else {
        document.title = `${pack.title} | Bleck's Cave`;
      }

      // Apply project-specific color scheme and CSS variables
      switchTheme(modpackId);

      // Mount top navigation bar with callbacks for portal return and project switching
      renderNavigation(
        document.body,
        modpackId,
        () => navigateTo('/'),
        (id) => navigateTo(`/${id}/overview`)
      );

      // Render the main article viewer and sidebar for the selected project
      renderWikiView(appContainer, modpackId, pageId);
    } else {
      document.title = "Bleck's Cave Minecraft Portals";

      // Remove sticky project navigation bar when returning to the portal landing
      const nav = document.body.querySelector('.nav-bar');
      if (nav) {
        nav.remove();
      }

      // Execute custom teardown on switcher component if present
      const navSwitcher = document.body.querySelector<HTMLElement & { cleanup?: () => void }>(
        '.nav-switcher-container'
      );
      if (navSwitcher?.cleanup) {
        navSwitcher.cleanup();
      }

      // Restore global portal color palette and background particle styles
      applyTheme(globalPortalTheme);

      // Mount dashboard project catalog and register selection callback
      activeCleanup = renderPortal(appContainer, (id) => {
        navigateTo(`/${id}/overview`);
      });
    }
  };

  // ---------- TRANSITION ORCHESTRATION (execute instant render or animated transition)
  // Bypass visual transitions on initial load to ensure immediate content display
  if (isInitialLoad) {
    performStateChange();
  } else {
    // Prefer native View Transitions API for seamless cross-document animations
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        performStateChange();
      });
    } else {
      // Fallback to custom CSS liquid wipe animation for unsupported browsers
      triggerThemeTransition(performStateChange);
    }
  }
}

// ---------- HISTORY NAVIGATION
/**
 * Handles smooth dynamic redirection using the History API.
 * @param {string} targetPath - The destination pathname (e.g. '/velocita-optimized/features').
 */
export function navigateTo(targetPath: string): void {
  if (window.location.pathname === targetPath) {
    // Re-run routing logic when clicking current path to ensure view consistency
    handleRouting(targetPath);
  } else {
    // Update browser URL bar without triggering full page reload
    window.history.pushState(null, '', targetPath);
    handleRouting(targetPath);
  }
}

// ---------- ROUTER INITIALIZATION & EVENT BINDING
export function initRouter(): void {
  // Listen for browser backward and forward navigation buttons
  window.addEventListener('popstate', () => {
    handleRouting(window.location.pathname);
  });

  // Execute initial routing sequence after DOM tree construction completes
  document.addEventListener('DOMContentLoaded', () => {
    // Mount global search dialog and connect selection to history navigation
    initSearchModal((packId, pageId) => {
      navigateTo(`/${packId}/${pageId}`);
    });

    handleRouting(window.location.pathname || '/', true);
  });
}
