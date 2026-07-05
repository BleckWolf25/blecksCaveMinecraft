/**
 * @file Card.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Modular reusable interactive card component for projects.
 *
 * @description
 * Renders interactive project preview cards for modpacks, mods, resource packs, and shaders, incorporating custom dynamic HSL glowing borders, pack-specific SVG icons, category badges, archive tags, and accessibility hooks for keyboard navigation.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Modpack } from '../../types.ts';
import { playClickSound } from './sound.ts';
import { PACK_ICONS } from '../../utils/icons.ts';

// ---------- TYPE DEFINITIONS
export interface CardProps {
  pack: Modpack;
  isFeatured?: boolean;
  onClick?: (packId: string) => void;
  className?: string;
}

// ---------- COMPONENT: CARD
/**
 * Modular Reusable Card Component.
 * Unified card rendering with support for custom dynamic HSL glowing borders, pack-specific SVG icons, archive tags, and accessibility hooks.
 */
export function Card(props: CardProps): HTMLElement {
  // ---------- ELEMENT CREATION & CLASS ASSIGNMENT (apply base styles and visual flags)
  const card = document.createElement('article');
  card.className = 'modpack-card';

  // Highlight featured project cards with expanded layout styling
  if (props.isFeatured) {
    card.classList.add('featured-hero-card');
  }

  // Visually subdue legacy or deprecated project cards
  if (props.pack.isArchived) {
    card.classList.add('archived');
  }

  // Append optional space-delimited utility class names
  if (props.className) {
    props.className
      .split(' ')
      .filter(Boolean)
      .forEach((c) => card.classList.add(c));
  }

  // ---------- ACCESSIBILITY & METADATA ATTRIBUTES (set roles, tab order, and data tags)
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View ${props.pack.title} wiki`);
  card.dataset.packId = props.pack.id;

  // Embed project tag list in data attribute for instant grid filtering
  if (props.pack.tags) {
    card.dataset.tags = props.pack.tags.join(',');
  }

  // ---------- THEME TOKEN INJECTION (bind HSL color variable to card style)
  card.style.setProperty('--card-primary', props.pack.colors.primary);

  // ---------- ICONOGRAPHY & METADATA RESOLUTION (retrieve project icon and format summary footer)
  // Fallback to generic cube symbol when project ID lacks a specific vector icon
  const packIcon =
    PACK_ICONS[props.pack.id] ??
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';

  const projectType = props.pack.type || 'modpack';
  const typeLabel = projectType.replace('-', ' ').toUpperCase();

  // Assemble footer specification text based on project category
  let footerTag = props.pack.specs.mcVersions?.[0] ?? '';
  if (projectType === 'resource-pack') {
    footerTag += ` • ${props.pack.specs.resolution || 'Texture'}`;
  } else if (projectType === 'shader') {
    footerTag += ` • ${props.pack.specs.performanceTier || 'Shader'}`;
  } else {
    footerTag += ` • ${props.pack.specs.loaders?.[0] ?? 'Modpack'}`;
  }

  // ---------- DOM ASSEMBLY (inject badges, headings, summary, and action arrow)
  card.innerHTML = `
    ${
      props.isFeatured
        ? ''
        : `
    <div class="card-badges">
      <span class="category-badge-portal type-${projectType}">${typeLabel}</span>
      ${props.pack.isArchived ? '<span class="archive-badge-portal">Archived</span>' : props.pack.badge ? `<span class="status-badge-portal">${props.pack.badge}</span>` : ''}
    </div>`
    }
    <div class="card-header">
      <div class="card-icon">${packIcon}</div>
      <h2 class="card-title">${props.pack.title}</h2>
      <p class="card-summary">${props.pack.summary}</p>
    </div>
    <div class="card-footer">
      ${props.isFeatured ? '<div></div>' : `<span class="card-tag">${footerTag}</span>`}
      <div class="card-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>
  `;

  // ---------- EVENT BINDING (attach mouse and keyboard interaction listeners)
  const triggerClick = () => {
    playClickSound();
    if (props.onClick) {
      props.onClick(props.pack.id);
    }
  };

  card.addEventListener('click', triggerClick);

  // Allow keyboard activation via Enter or Space key press
  card.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerClick();
    }
  });

  return card;
}
