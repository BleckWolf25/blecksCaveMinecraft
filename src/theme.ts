import { globalPortalTheme, modpacks } from './wiki-data.ts';
import { ThemeConfig, Modpack } from './types.ts';

/**
 * Loads a Google Font dynamically by appending or modifying a link tag in the document head.
 * @param {string} fontImportUrl - The URL of the Google Font to import.
 * @param {string} _themeId - The unique ID of the theme.
 */
function loadGoogleFont(fontImportUrl: string, _themeId: string): void {
  const linkId = 'theme-google-font';
  let fontLink = document.getElementById(linkId) as HTMLLinkElement | null;

  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.id = linkId;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }

  // Only update if the URL has changed to prevent redraw flickering
  if (fontLink.href !== fontImportUrl) {
    fontLink.href = fontImportUrl;
  }
}

/**
 * Injects a given theme's design tokens into the :root CSS variables.
 * @param {ThemeConfig | Modpack} theme - The theme configuration object.
 */
export function applyTheme(theme: ThemeConfig | Modpack): void {
  const root = document.documentElement;
  const body = document.body;

  // 1. Dynamic Font Injection
  if (theme.fontImport) {
    loadGoogleFont(theme.fontImport, theme.id);
  }

  // 2. Set CSS custom properties on :root
  root.style.setProperty('--font-family', theme.fontFamily);

  Object.entries(theme.colors).forEach(([key, HslValue]) => {
    // We convert HslValue keys (like primaryBg -> --primary-bg)
    const cssVariableName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVariableName, HslValue);
  });

  // 3. Update body theme classes to trigger custom animations/effects
  // First, remove any existing theme classes
  Array.from(body.classList).forEach(className => {
    if (className.startsWith('theme-')) {
      body.classList.remove(className);
    }
  });

  // Add current theme class
  body.classList.add(`theme-${theme.id}`);

  // Set data attribute for global selector targeting
  body.setAttribute('data-theme', theme.id);
}

/**
 * Switches theme by modpack ID. Falls back to global portal theme if id is 'portal' or not found.
 * @param {string} modpackId - The ID of the modpack.
 */
export function switchTheme(modpackId: string): void {
  const modpack = modpacks[modpackId];
  if (modpack) {
    applyTheme(modpack);
  } else {
    applyTheme(globalPortalTheme);
  }
}
