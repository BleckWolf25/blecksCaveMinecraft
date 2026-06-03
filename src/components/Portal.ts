import { modpacks, globalPortalTheme, appLabels } from '../wiki-data.ts';
import { Card } from './ui/Card.ts';
import { Button } from './ui/Button.ts';
import { CleanupCallback, Modpack } from '../types.ts';

let particleAnimationId: number | null = null;

interface MouseState {
  x: number | null;
  y: number | null;
  radius: number;
}

/**
 * Initializes a canvas particle network background for the portal dashboard.
 * @param {HTMLCanvasElement} canvas - The target canvas element.
 * @returns {CleanupCallback} Cleanup handler.
 */
function initParticles(canvas: HTMLCanvasElement): CleanupCallback {
  const ctx = canvas.getContext('2d');
  if (!ctx) {return () => {};}

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles: Particle[] = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 25000));
  const mouse: MouseState = { x: null, y: null, radius: 150 };

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;

    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) { this.vx *= -1; }
      if (this.y < 0 || this.y > height) { this.vy *= -1; }

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      if (!ctx) {return;}
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.radius * 2, this.radius * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function handleMouseMove(e: MouseEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function handleMouseLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseleave', handleMouseLeave);

  function animate() {
    if (!ctx) {return;}
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const alpha = ((100 - dist) / 100) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particleAnimationId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup handler
  return () => {
    if (particleAnimationId !== null) {
      cancelAnimationFrame(particleAnimationId);
    }
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Renders the Portal dashboard into the target container.
 * Rebuilt using modular Card and Button components with complete types.
 * @param {HTMLElement} container - The target container.
 * @param {(packId: string) => void} onSelectModpack - The selection callback.
 * @returns {CleanupCallback} Cleanup handler.
 */
export function renderPortal(container: HTMLElement, onSelectModpack: (packId: string) => void): CleanupCallback {
  // Cancel previous animation if active
  if (particleAnimationId !== null) {
    cancelAnimationFrame(particleAnimationId);
  }

  container.innerHTML = '';

  // 1. Canvas background
  const canvas = document.createElement('canvas');
  canvas.id = 'portal-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  // 2. Wrapper
  const portalWrapper = document.createElement('div');
  portalWrapper.className = 'portal-container';

  // 3. Header
  const header = document.createElement('header');
  header.className = 'portal-header';
  header.innerHTML = `
    <h1 class="portal-title">${globalPortalTheme.title}</h1>
    <p class="portal-subtitle">${globalPortalTheme.subtitle}</p>
  `;
  portalWrapper.appendChild(header);

  // 4. Hero card section
  const heroContainer = document.createElement('div');
  heroContainer.className = 'portal-hero-section';
  portalWrapper.appendChild(heroContainer);

  // -------------------------------------------------------------------------
  // Filter State
  // -------------------------------------------------------------------------
  const filterState = {
    categories: new Set<string>(),    // empty = all
    loaders:    new Set<string>(),    // empty = all
    versions:   new Set<string>(),    // empty = all
    showArchived: false,
  };

  // Derive all unique filter options from data
  const allCategories = new Set<string>();
  const allLoaders    = new Set<string>();
  const allVersions   = new Set<string>();

  Object.values(modpacks).forEach(pack => {
    pack.tags?.forEach(t => allCategories.add(t));
    pack.specs.loaders?.forEach(l => allLoaders.add(l));
    pack.specs.mcVersions?.forEach(v => allVersions.add(v));
  });

  const sortedCategories = Array.from(allCategories).sort();
  const sortedLoaders    = Array.from(allLoaders).sort();
  const sortedVersions   = Array.from(allVersions).sort((a, b) => {
    // Sort versions descending (newest first)
    return b.localeCompare(a, undefined, { numeric: true });
  });

  // -------------------------------------------------------------------------
  // Filter UI builder
  // -------------------------------------------------------------------------
  const filterSection = document.createElement('div');
  filterSection.className = 'portal-filter-section';

  const filterGroupsRow = document.createElement('div');
  filterGroupsRow.className = 'portal-filter-groups';

  // Tracks all toggle buttons keyed by "groupKey:value"
  const toggleBtnMap = new Map<string, HTMLButtonElement>();

  // Count badge updater
  function updateGroupBadge(groupEl: HTMLElement, count: number) {
    const badge = groupEl.querySelector('.filter-group-badge') as HTMLElement | null;
    if (!badge) {return;}
    badge.textContent = count > 0 ? String(count) : '';
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  function buildFilterGroup(
    options: string[],
    stateSet: Set<string>,
    groupKey: string,
    groupEl: HTMLElement
  ) {
    const btnRow = document.createElement('div');
    btnRow.className = 'filter-group-btns';

    options.forEach(opt => {
      const btn = Button({
        text: opt,
        variant: 'filter',
        className: 'ui-btn-filter',
        onClick: () => {
          if (stateSet.has(opt)) {
            stateSet.delete(opt);
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
          } else {
            stateSet.add(opt);
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          }
          updateGroupBadge(groupEl, stateSet.size);
          applyFilter();
        }
      });
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.filterKey = `${groupKey}:${opt}`;
      toggleBtnMap.set(`${groupKey}:${opt}`, btn);
      btnRow.appendChild(btn);
    });

    groupEl.appendChild(btnRow);
  }

  // --- Category Group ---
  const categoryGroup = document.createElement('div');
  categoryGroup.className = 'filter-group';
  categoryGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">Category</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedCategories, filterState.categories, 'cat', categoryGroup);
  filterGroupsRow.appendChild(categoryGroup);

  // --- Loader Group ---
  const loaderGroup = document.createElement('div');
  loaderGroup.className = 'filter-group';
  loaderGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">Loader</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedLoaders, filterState.loaders, 'loader', loaderGroup);
  filterGroupsRow.appendChild(loaderGroup);

  // --- MC Version Group ---
  const versionGroup = document.createElement('div');
  versionGroup.className = 'filter-group';
  versionGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">MC Version</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedVersions, filterState.versions, 'ver', versionGroup);
  filterGroupsRow.appendChild(versionGroup);

  filterSection.appendChild(filterGroupsRow);

  // --- Archived + Reset row ---
  const filterMeta = document.createElement('div');
  filterMeta.className = 'portal-filter-meta';

  // Archived toggle
  const archiveLabel = document.createElement('label');
  archiveLabel.className = 'filter-archive-toggle';
  archiveLabel.innerHTML = `
    <input type="checkbox" id="filter-archived-toggle" />
    <span>Show archived packs</span>
  `;
  const archiveCheckbox = archiveLabel.querySelector('input') as HTMLInputElement;
  archiveCheckbox.addEventListener('change', () => {
    filterState.showArchived = archiveCheckbox.checked;
    applyFilter();
  });
  filterMeta.appendChild(archiveLabel);

  // Reset button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'filter-reset-btn';
  resetBtn.textContent = 'Reset filters';
  resetBtn.addEventListener('click', () => {
    filterState.categories.clear();
    filterState.loaders.clear();
    filterState.versions.clear();
    filterState.showArchived = false;
    archiveCheckbox.checked = false;
    toggleBtnMap.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    updateGroupBadge(categoryGroup, 0);
    updateGroupBadge(loaderGroup, 0);
    updateGroupBadge(versionGroup, 0);
    applyFilter();
  });
  filterMeta.appendChild(resetBtn);

  filterSection.appendChild(filterMeta);
  portalWrapper.appendChild(filterSection);

  // -------------------------------------------------------------------------
  // Grid title + card grid
  // -------------------------------------------------------------------------
  const gridTitle = document.createElement('h3');
  gridTitle.className = 'portal-grid-title';
  gridTitle.textContent = appLabels.gridTitle;
  portalWrapper.appendChild(gridTitle);

  const grid = document.createElement('div');
  grid.className = 'portal-grid';
  grid.setAttribute('role', 'list');

  // Hero card (Aetas Ferrea)
  const heroPack = modpacks['aetas-ferrea'];
  if (heroPack) {
    const heroCard = Card({ pack: heroPack, isFeatured: true, onClick: onSelectModpack });
    heroContainer.appendChild(heroCard);
  }

  // Grid cards — all packs
  const gridCards: HTMLElement[] = [];
  Object.values(modpacks).forEach(pack => {
    const card = Card({ pack, isFeatured: false, onClick: onSelectModpack });
    grid.appendChild(card);
    gridCards.push(card);
  });

  portalWrapper.appendChild(grid);
  container.appendChild(portalWrapper);

  // -------------------------------------------------------------------------
  // Filter logic
  // -------------------------------------------------------------------------

  // Helper: check if a pack matches the current filters
  function packMatchesFilters(pack: Modpack): boolean {
    const hasCategories = filterState.categories.size > 0;
    const hasLoaders    = filterState.loaders.size > 0;
    const hasVersions   = filterState.versions.size > 0;

    // Archived visibility
    if (pack.isArchived && !filterState.showArchived) {
      return false;
    }

    // Category: OR within group (pack must have at least one selected tag)
    if (hasCategories) {
      const packTags = pack.tags || [];
      const matchesCategory = packTags.some(t => filterState.categories.has(t));
      if (!matchesCategory) {return false;}
    }

    // Loader: OR within group
    if (hasLoaders) {
      const packLoaders = pack.specs.loaders || [];
      const matchesLoader = packLoaders.some(l => filterState.loaders.has(l));
      if (!matchesLoader) {return false;}
    }

    // Version: OR within group
    if (hasVersions) {
      const packVersions = pack.specs.mcVersions || [];
      const matchesVersion = packVersions.some(v => filterState.versions.has(v));
      if (!matchesVersion) {return false;}
    }

    return true;
  }

  const applyFilter = () => {
    // Hero card: ALWAYS visible, never hide
    const heroCard = heroContainer.querySelector('[data-pack-id="aetas-ferrea"]') as HTMLElement;
    if (heroCard) {
      heroCard.classList.remove('hidden');
    }

    gridCards.forEach(card => {
      const packId = card.dataset.packId || '';
      const pack   = modpacks[packId];
      if (!pack) { card.classList.add('hidden'); return; }

      // Apply filter matching logic
      if (!packMatchesFilters(pack)) {
        card.classList.add('hidden');
        return;
      }

      card.classList.remove('hidden');
    });
  };

  // Initial render
  applyFilter();

  // Start particle system
  const cleanup = initParticles(canvas);
  return cleanup;
}
