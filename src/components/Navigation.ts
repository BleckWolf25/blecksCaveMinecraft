import { modpacks, globalPortalTheme } from '../wiki-data.ts';
import { Button } from './ui/Button.ts';

export interface NavigationContainerElement extends HTMLDivElement {
  cleanup?: () => void;
}

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
  // Remove existing nav if it exists
  const existingNav = parentElement.querySelector('.nav-bar');
  if (existingNav) {
    existingNav.remove();
  }

  const currentPack = modpacks[currentModpackId];
  if (!currentPack) {return;}

  const nav = document.createElement('nav');
  nav.className = 'nav-bar';

  // 1. Navigation Brand (Home Button)
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  brand.innerHTML = `
    <span class="nav-brand-logo">🌌</span>
    <span class="nav-brand-name">${globalPortalTheme.brandName}</span>
  `;
  brand.addEventListener('click', onNavigateHome);
  nav.appendChild(brand);

  // 2. Modpack Switcher Container
  const switcherContainer = document.createElement('div') as NavigationContainerElement;
  switcherContainer.className = 'nav-switcher-container';

  // Active Modpack Display Button (Trigger)
  let currentIcon = '📦';
  if (currentPack.id === 'velocita-optimized') { currentIcon = '⚡'; }
  else if (currentPack.id === 'builder-plus-plus') { currentIcon = '📐'; }
  else if (currentPack.id === 'better-than-pvp') { currentIcon = '🎯'; }
  else if (currentPack.id === 'aetas-ferrea') { currentIcon = '⚔️'; }
  else if (currentPack.id === 'mc-vanilla-tweaked') { currentIcon = '🌳'; }

  const switcherBtn = Button({
    html: `
      <span>${currentIcon}</span>
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

  // Dropdown list
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-switcher-dropdown';

  Object.values(modpacks).forEach(pack => {
    const item = document.createElement('div');
    item.className = `dropdown-item ${pack.id === currentModpackId ? 'active' : ''}`;

    let itemIcon = '📦';
    if (pack.id === 'velocita-optimized') { itemIcon = '⚡'; }
    else if (pack.id === 'builder-plus-plus') { itemIcon = '📐'; }
    else if (pack.id === 'better-than-pvp') { itemIcon = '🎯'; }
    else if (pack.id === 'aetas-ferrea') { itemIcon = '⚔️'; }
    else if (pack.id === 'mc-vanilla-tweaked') { itemIcon = '🌳'; }

    item.innerHTML = `
      <div class="dropdown-item-title">${itemIcon} ${pack.title} ${pack.isArchived ? '(Archived)' : ''}</div>
      <div class="dropdown-item-desc">${pack.specs.mcVersions?.[0] ?? ''} • ${pack.specs.loaders?.[0] ?? ''}</div>
    `;

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

  // Prepend to parent element
  parentElement.insertBefore(nav, parentElement.firstChild);

  // Close dropdown on outside click
  const closeDropdownHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!switcherContainer.contains(target)) {
      dropdown.classList.remove('show');
    }
  };
  document.addEventListener('click', closeDropdownHandler);

  // Save the handler reference on the switcherContainer to destroy properly later
  switcherContainer.cleanup = () => {
    document.removeEventListener('click', closeDropdownHandler);
  };
}
