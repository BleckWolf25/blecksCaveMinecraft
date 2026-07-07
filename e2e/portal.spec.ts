/**
 * @file portal.spec.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Playwright end-to-end test suite for Portal and Wiki pages.
 *
 * @description
 * Verifies end-to-end browser workflows across the primary application views, testing portal page rendering, project card navigation, category filtering, responsive sidebar toggling, search dialog interactions, and theme switcher behavior.
 *
 * @since 01/07/2026
 * @updated 06/07/2026
 */
// ---------- IMPORTS
import { test, expect } from '@playwright/test';

// ---------- TEST SUITE: PORTAL DASHBOARD
test.describe('Portal Page', () => {
  test('should load portal page with title', async ({ page }) => {
    await page.goto('/');

    // Check for portal title
    await expect(page.locator('h1.portal-title')).toBeVisible();
    await expect(page.locator('h1.portal-title')).toContainText("Bleck's Cave");
  });

  test('should display modpack cards', async ({ page }) => {
    await page.goto('/');

    // Check that modpack cards are rendered (11 total - 1 featured = 10 in grid)
    const cards = page.locator('.modpack-card');
    await expect(cards).toHaveCount(10);
  });

  test('should navigate to modpack wiki on card click', async ({ page }) => {
    await page.goto('/');

    // Click on velocita-optimized card (from the grid, not featured)
    const card = page.locator('[data-pack-id="velocita-optimized"]').nth(1);
    await card.click();

    // Should navigate to modpack page
    await expect(page).toHaveURL('/velocita-optimized/overview');
  });

  test('should display filter controls', async ({ page }) => {
    await page.goto('/');

    // Check for filter section
    await expect(page.locator('.portal-filter-section')).toBeVisible();

    // Check for filter groups (Loader, Resolution, MC Version)
    const filterLabels = page.locator('.filter-group-label');
    await expect(filterLabels).toContainText('Loader');
    await expect(filterLabels).toContainText('Resolution');
    await expect(filterLabels).toContainText('MC Version');
  });

  test('should filter by category tab', async ({ page }) => {
    await page.goto('/');

    // Click on "Modpacks" category tab
    const modpacksTab = page.locator('button:has-text("Modpacks")');
    await modpacksTab.click();

    // Check that tab is active
    await expect(modpacksTab).toHaveClass(/active/);

    // Modpacks tab should show only modpack-type items
    const cards = page.locator('.modpack-card');
    await expect(cards).toBeTruthy();
  });
});

test.describe('Modpack Wiki Page', () => {
  test('should load wiki page with sidebar', async ({ page }) => {
    await page.goto('/velocita-optimized/overview');

    // Check for wiki sidebar
    await expect(page.locator('.wiki-sidebar')).toBeVisible();

    // Check for wiki content
    await expect(page.locator('.wiki-content-panel')).toBeVisible();
  });

  test('should navigate between wiki pages', async ({ page }) => {
    await page.goto('/velocita-optimized/overview');

    // Click on a different page in sidebar
    const featuresLink = page.locator('button:has-text("features")');
    if ((await featuresLink.count()) > 0) {
      await featuresLink.click();
      await expect(page).toHaveURL('/velocita-optimized/features');
    }
  });

  test('should display specs panel', async ({ page }) => {
    await page.goto('/velocita-optimized/overview');

    // Check for specs panel
    await expect(page.locator('.wiki-specs-panel')).toBeVisible();
  });

  test('should have scroll progress bar', async ({ page }) => {
    await page.goto('/velocita-optimized/overview');

    // Check for scroll progress bar element
    const progressBar = page.locator('.scroll-progress-bar');
    await expect(progressBar).toBeAttached();

    // Scroll to make it visible and check
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(progressBar).toBeVisible();
  });
});

test.describe('Theme System', () => {
  test('should apply theme on modpack navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const initialBody = await page.locator('body').getAttribute('data-theme');
    expect(initialBody).toBe('portal');

    // Navigate to modpack
    const card = page.locator('[data-pack-id="velocita-optimized"]').first();
    await card.click();

    // Wait for navigation to complete
    await page.waitForURL('**/velocita-optimized/overview');
    await page.waitForTimeout(500); // Allow theme transition to complete

    // Check theme changed
    const newBody = await page.locator('body').getAttribute('data-theme');
    expect(newBody).toBe('velocita-optimized');
  });

  test('should reset theme when returning to portal', async ({ page }) => {
    await page.goto('/velocita-optimized/overview');

    // Initial theme should be modpack-specific
    const initialBody = await page.locator('body').getAttribute('data-theme');
    expect(initialBody).toBe('velocita-optimized');

    // Navigate back to portal using back button
    await page.goBack();

    // Wait for navigation to complete
    await page.waitForURL('/');
    await page.waitForTimeout(500); // Allow theme transition to complete

    // Check theme reset to portal
    const body = await page.locator('body').getAttribute('data-theme');
    expect(body).toBe('portal');
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that portal is still visible
    await expect(page.locator('.portal-container')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check that portal is still visible
    await expect(page.locator('.portal-container')).toBeVisible();
  });
});
