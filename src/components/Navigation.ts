/**
 * @file Navigation.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Top navigation bar and project dropdown switcher.
 *
 * @description
 * Renders the persistent header navigation bar when exploring individual project wikis, providing portal return branding, quick project selection via an interactive dropdown menu, and document click listener management for dropdown dismissal.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { modpacks, globalPortalTheme } from '../wiki-data.ts';
import { Button } from './ui/Button.ts';
import { PACK_ICONS } from '../utils/icons.ts';

// ---------- TYPE DEFINITIONS
export interface NavigationContainerElement extends HTMLDivElement {
  cleanup?: () => void;
}

// ---------- COMPONENT: NAVIGATION BAR
/**
 * Renders the sticky top navigation bar.
 * Rebuilt using modular Button elements and custom dropdown animations.
 * @param {HTMLElement} parentElement - The element to prepend the navigation to.
 * @param {string} currentModpackId - The ID of the currently selected modpack.
 * @param {() => void} onNavigateHome - Home navigation callback.
 * @param {(packId: string) => void} onSelectModpack - Modpack select callback.
 */
export function renderNavigation(
  parentElement: HTMLElement,
  currentModpackId: string,
  onNavigateHome: () => void,
  onSelectModpack: (packId: string) => void
): void {
  // ---------- GUARD CLAUSE (verify target project exists)
  const currentPack = modpacks[currentModpackId];
  if (!currentPack) {
    return;
  }

  // ---------- CLEANUP (remove existing navigation bar)
  // Destroy prior header element to avoid duplicate navigation bars during rapid route changes
  const existingNav = parentElement.querySelector('.nav-bar');
  if (existingNav) {
    existingNav.remove();
  }

  // ---------- ELEMENT CREATION (build navigation container and brand logo)
  const nav = document.createElement('nav');
  nav.className = 'nav-bar';

  // Create portal return link with brand emblem and title
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  brand.innerHTML = `
    <img src="/blecks_cave.png" alt="Bleck's Cave Logo" class="nav-brand-logo" />
    <span class="nav-brand-name">${globalPortalTheme.brandName}</span>
  `;
  brand.addEventListener('click', onNavigateHome);
  nav.appendChild(brand);

  // ---------- PROJECT SWITCHER SETUP (create dropdown trigger button and menu container)
  const switcherContainer = document.createElement('div') as NavigationContainerElement;
  switcherContainer.className = 'nav-switcher-container';

  // Fallback to generic cube symbol when active project lacks vector artwork
  const currentIcon = PACK_ICONS[currentPack.id] ?? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';

  // Mount interactive dropdown button displaying active project title and icon
  const switcherBtn = Button({
    html: `
      <span style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${currentIcon}</span>
      <span>${currentPack.title}</span>
      <span style="font-size: 0.65rem; opacity: 0.7; margin-left: 6px;">▼</span>
    `,
    variant: 'secondary',
    className: 'nav-switcher-btn',
    onClick: (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    }
  });

  switcherContainer.appendChild(switcherBtn);

  // ---------- DROPDOWN POPULATION (generate selectable items for all registered projects)
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-switcher-dropdown';

  // Iterate across project catalog to build clickable dropdown rows
  Object.values(modpacks).forEach(pack => {
    const item = document.createElement('div');
    item.className = `dropdown-item ${pack.id === currentModpackId ? 'active' : ''}`;
    item.setAttribute('data-pack', pack.id);

    const itemIcon = PACK_ICONS[pack.id] ?? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';

    const descParts = [pack.specs.mcVersions?.[0], pack.specs.loaders?.[0]].filter(Boolean);
    const descStr = descParts.join(' • ');
    const archivedBadge = pack.isArchived ? '<span class="archive-tag">ARCHIVED</span>' : '';

    item.innerHTML = `
      <div class="dropdown-icon">${itemIcon}</div>
      <div class="dropdown-item-content">
        <div class="dropdown-item-title">${pack.title} ${archivedBadge}</div>
        <div class="dropdown-item-desc">${descStr}</div>
      </div>
    `;

    // Connect selection callback and dismiss menu on item click
    item.addEventListener('click', () => {
      dropdown.classList.remove('show');
      if (pack.id !== currentModpackId) {
        onSelectModpack(pack.id);
      }
    });

    dropdown.appendChild(item);
  });

  switcherContainer.appendChild(dropdown);
  nav.appendChild(switcherContainer);

  // ---------- DOM MOUNTING & EVENT BINDING (prepend header and attach global dismissal listeners)
  // Insert navigation header at top of parent body container
  parentElement.insertBefore(nav, parentElement.firstChild);

  // Dismiss open switcher dropdown when user clicks outside menu boundary
  const closeDropdownHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!switcherContainer.contains(target)) {
      dropdown.classList.remove('show');
    }
  };
  document.addEventListener('click', closeDropdownHandler);

  // Retain document listener removal method on container element for router teardown
  switcherContainer.cleanup = () => {
    document.removeEventListener('click', closeDropdownHandler);
  };
}
