/**
 * @file Portal.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Immersive landing portal dashboard.
 *
 * @description
 * Renders the central application landing dashboard, generating the background particle canvas, featured hero spotlight banner, dynamic project filter controls, and interactive project selection card grid.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { modpacks, globalPortalTheme, appLabels } from '../wiki-data.ts';
import { Card } from './ui/Card.ts';
import { CleanupCallback } from '../types.ts';
import { initParticles, cancelParticleAnimation } from '../utils/particleSystem.ts';
import { initFilterSystem } from '../utils/filterSystem.ts';

// ---------- COMPONENT: PORTAL DASHBOARD
/**
 * Renders the Portal dashboard into the target container.
 * Rebuilt using modular Card and Button components with complete types.
 * @param {HTMLElement} container - The target container.
 * @param {(packId: string) => void} onSelectModpack - The selection callback.
 * @returns {CleanupCallback} Cleanup handler.
 */
export function renderPortal(
  container: HTMLElement,
  onSelectModpack: (packId: string) => void
): CleanupCallback {
  // ---------- GUARD CLAUSE (verify target DOM container exists)
  if (!container) {
    return () => {};
  }

  // ---------- ANIMATION RESET (cancel active particle loops prior to remounting)
  cancelParticleAnimation();
  container.innerHTML = '';

  // ---------- DOM ASSEMBLY (create canvas background, wrapper, and header)
  // Mount background particle rendering surface behind content layer
  const canvas = document.createElement('canvas');
  canvas.id = 'portal-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  // Create main centered content wrapper
  const portalWrapper = document.createElement('div');
  portalWrapper.className = 'portal-container';

  // Inject primary portal branding title and instruction subtitle
  const header = document.createElement('header');
  header.className = 'portal-header';
  header.innerHTML = `
    <h1 class="portal-title">${globalPortalTheme.title}</h1>
    <p class="portal-subtitle">${globalPortalTheme.subtitle}</p>
  `;
  portalWrapper.appendChild(header);

  // ---------- FEATURED HERO SPOTLIGHT (resolve and render highlighted project banner)
  const heroContainer = document.createElement('div');
  heroContainer.className = 'portal-hero-section';
  portalWrapper.appendChild(heroContainer);

  // Retrieve designated hero project or fall back to Aetas Ferrea
  const heroPack = Object.values(modpacks).find((p) => p.featured) || modpacks['aetas-ferrea'];
  if (heroPack) {
    const heroTitle = document.createElement('h3');
    heroTitle.className = 'portal-grid-title';
    heroTitle.textContent = 'FEATURED PROJECTS';
    heroContainer.appendChild(heroTitle);

    const heroCard = Card({ pack: heroPack, isFeatured: true, onClick: onSelectModpack });
    heroContainer.appendChild(heroCard);
  }

  // ---------- FILTER & CATALOG GRID SETUP (mount category filter controls and project card container)
  const filterContainer = document.createElement('div');
  filterContainer.className = 'portal-filter-container';
  portalWrapper.appendChild(filterContainer);

  const gridTitle = document.createElement('h3');
  gridTitle.className = 'portal-grid-title';
  gridTitle.textContent = appLabels.gridTitle;
  portalWrapper.appendChild(gridTitle);

  const grid = document.createElement('div');
  grid.className = 'portal-grid';
  grid.setAttribute('role', 'list');

  // Populate grid catalog with standard preview cards for all registered projects
  const gridCards: HTMLElement[] = [];
  Object.values(modpacks).forEach((pack) => {
    const card = Card({ pack, isFeatured: false, onClick: onSelectModpack });
    grid.appendChild(card);
    gridCards.push(card);
  });

  portalWrapper.appendChild(grid);

  // ---------- FILTER SYSTEM INITIALIZATION (bind interactive tab filtering and deduplication logic)
  const { applyFilter, packMatchesFilters, getActiveTab } = initFilterSystem({
    container: filterContainer,
    onFilterChange: () => {
      const activeTab = getActiveTab();

      // Ensure featured spotlight remains visible during tab switches
      heroContainer.style.display = 'block';
      if (activeTab === 'all') {
        gridTitle.textContent = appLabels.gridTitle;
      } else {
        gridTitle.textContent = `${activeTab.replace('-', ' ').toUpperCase()} PROJECTS`;
      }

      // Filter grid cards and hide hero pack from general list to prevent duplication
      gridCards.forEach((card) => {
        const packId = card.dataset.packId || '';
        const pack = modpacks[packId];
        if (!pack) {
          card.classList.add('hidden');
          return;
        }

        // Hide card if it fails current tab filter criteria
        if (!packMatchesFilters(pack)) {
          card.classList.add('hidden');
          return;
        }

        // Prevent featured project from appearing twice on the dashboard
        if (heroPack && pack.id === heroPack.id) {
          card.classList.add('hidden');
          return;
        }

        card.classList.remove('hidden');
      });
    },
  });

  // Execute initial filter evaluation to hide duplicate featured card
  applyFilter();
  container.appendChild(portalWrapper);

  // ---------- PARTICLE SYSTEM ACTIVATION (mount canvas animation loop and return cleanup handle)
  const cleanup = initParticles(canvas);
  return cleanup;
}
