import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, switchTheme } from '../src/theme.ts';
import { globalPortalTheme, modpacks } from '../src/wiki-data.ts';

describe('Theme Engine', () => {
  beforeEach(() => {
    // Reset body classes and variables
    document.body.className = '';
    document.body.removeAttribute('data-theme');
    document.documentElement.removeAttribute('style');
  });

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

    // Switch theme and assert old is removed and new is added
    applyTheme(modpacks['velocita-optimized']);
    expect(document.body.classList.contains('theme-portal')).toBe(false);
    expect(document.body.classList.contains('theme-velocita-optimized')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('velocita-optimized');
  });

  it('should fallback to portal defaults on invalid theme switch', () => {
    switchTheme('non-existent-pack');
    expect(document.body.classList.contains('theme-portal')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(globalPortalTheme.colors.primary);
  });
});
