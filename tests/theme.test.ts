/**
 * @file theme.test.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Unit test suite for the dynamic theme engine.
 *
 * @description
 * Verifies that the theme engine correctly calculates and applies CSS custom variables to root elements, toggles data attributes and body theme classes, handles dynamic transitions, and gracefully falls back to the portal default theme when an invalid pack identifier is requested.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, switchTheme } from '../src/theme.ts';
import { globalPortalTheme, modpacks } from '../src/wiki-data.ts';

// ---------- TEST SUITE: THEME ENGINE
describe('Theme Engine', () => {
  // ---------- SETUP HOOKS
  beforeEach(() => {
    document.body.className = '';
    document.body.removeAttribute('data-theme');
    document.documentElement.removeAttribute('style');
  });

  // ---------- SUITE: VARIABLE & ATTRIBUTE INJECTION
  it('should apply theme custom variables and colors to root', () => {
    applyTheme(globalPortalTheme);

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--font-family')).toBe(globalPortalTheme.fontFamily);
    expect(rootStyle.getPropertyValue('--primary')).toBe(globalPortalTheme.colors.primary);
    expect(rootStyle.getPropertyValue('--primary-bg')).toBe(globalPortalTheme.colors.primaryBg);
  });

  it('should apply specific theme class and data attributes on body', () => {
    applyTheme(globalPortalTheme);
    expect(document.body.classList.contains('theme-portal')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('portal');

    applyTheme(modpacks['velocita-optimized']!);
    expect(document.body.classList.contains('theme-portal')).toBe(false);
    expect(document.body.classList.contains('theme-velocita-optimized')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('velocita-optimized');
  });

  // ---------- SUITE: FALLBACK & ERROR RECOVERY
  it('should fallback to portal defaults on invalid theme switch', () => {
    switchTheme('non-existent-pack');
    expect(document.body.classList.contains('theme-portal')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
      globalPortalTheme.colors.primary
    );
  });
});
