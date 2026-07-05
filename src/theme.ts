/**
 * @file theme.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Theme management functions.
 *
 * @description
 * Manages dynamic visual theming across the application, handling asynchronous loading of Google Font stylesheets, injecting HSL color tokens as custom CSS variables on the root document, and applying scoping class names and data attributes to the body element.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { globalPortalTheme, modpacks } from './wiki-data.ts';
import { ThemeConfig, Modpack } from './types.ts';

// ---------- FONT LOADING
/**
 * Loads a Google Font dynamically by appending or modifying a link tag in the document head.
 * @param {string} fontImportUrl - The URL of the Google Font to import.
 * @param {string} _themeId - The unique ID of the theme.
 */
function loadGoogleFont(fontImportUrl: string, _themeId: string): void {
  const linkId = 'theme-google-font';
  let fontLink = document.getElementById(linkId) as HTMLLinkElement | null;

  // Create stylesheet link element if it has not been mounted in document head yet
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.id = linkId;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }

  // Check existing href before reassigning to prevent redundant network requests and layout shifts
  if (fontLink.href !== fontImportUrl) {
    fontLink.href = fontImportUrl;
  }
}

// ---------- THEME TOKEN INJECTION
/**
 * Injects a given theme's design tokens into the :root CSS variables.
 * @param {ThemeConfig | Modpack} theme - The theme configuration object.
 */
export function applyTheme(theme: ThemeConfig | Modpack): void {
  const root = document.documentElement;
  const body = document.body;

  // ---------- FONT INJECTION (load stylesheet if configured)
  // Request typography stylesheet prior to updating font family CSS custom property
  if (theme.fontImport) {
    loadGoogleFont(theme.fontImport, theme.id);
  }

  // ---------- VARIABLE BINDING (map camelCase keys to kebab-case CSS properties)
  // Bind primary font family token directly to document root
  root.style.setProperty('--font-family', theme.fontFamily);

  // Convert HSL token map into CSS variables for stylesheet consumption
  Object.entries(theme.colors).forEach(([key, HslValue]) => {
    const cssVariableName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVariableName, String(HslValue));
  });

  // ---------- CLASS CLEANUP (remove prior theme selector classes)
  // Strip previous theme scoping classes to avoid style collisions across transitions
  Array.from(body.classList).forEach((className) => {
    if (className.startsWith('theme-')) {
      body.classList.remove(className);
    }
  });

  // ---------- ATTRIBUTE SETTING (apply new theme class and data attribute)
  // Attach new scoping class and dataset property for stylesheet selector specificity
  body.classList.add(`theme-${theme.id}`);
  body.setAttribute('data-theme', theme.id);
}

// ---------- THEME RESOLUTION
/**
 * Switches theme by modpack ID. Falls back to global portal theme if id is 'portal' or not found.
 * @param {string} modpackId - The ID of the modpack.
 */
export function switchTheme(modpackId: string): void {
  const modpack = modpacks[modpackId];
  if (modpack) {
    applyTheme(modpack);
  } else {
    // Revert to global portal styling when project ID is unrecognized or explicitly reset
    applyTheme(globalPortalTheme);
  }
}
