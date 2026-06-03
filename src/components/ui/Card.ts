import { Modpack } from '../../types.ts';
import { playClickSound } from './sound.ts';

export interface CardProps {
  pack: Modpack;
  isFeatured?: boolean;
  onClick?: (packId: string) => void;
  className?: string;
}

/**
 * Modular Reusable Card Component.
 * Unified card rendering with support for custom dynamic HSL glowing borders, pack-specific SVG icons, archive tags, and accessibility hooks.
 */
export function Card(props: CardProps): HTMLElement {
  const card = document.createElement('article');

  // Base classes
  card.className = 'modpack-card';
  if (props.isFeatured) {
    card.classList.add('featured-hero-card');
  }
  if (props.pack.isArchived) {
    card.classList.add('archived');
  }
  if (props.className) {
    props.className.split(' ').filter(Boolean).forEach(c => card.classList.add(c));
  }

  // Accessibility
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View ${props.pack.title} wiki`);
  card.dataset.packId = props.pack.id;
  if (props.pack.tags) {
    card.dataset.tags = props.pack.tags.join(',');
  }

  // Configure HSL variables dynamically
  card.style.setProperty('--card-primary', props.pack.colors.primary);

  // SVG Pack Icons Mapping
  let packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'; // Default Generic / Builder

  const id = props.pack.id;
  if (id === 'velocita-optimized') {
    packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  } else if (id === 'builder-plus-plus') {
    packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/><path d="M12 22V2"/></svg>';
  } else if (id === 'better-than-pvp') {
    packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
  } else if (id === 'aetas-ferrea') {
    packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>';
  } else if (id === 'mc-vanilla-tweaked') {
    packIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 21V9"/></svg>';
  }

  card.innerHTML = `
    ${props.pack.isArchived ? '<span class="archive-badge-portal">Archived</span>' : ''}
    <div class="card-header">
      <div class="card-icon">${packIcon}</div>
      <h2 class="card-title">${props.pack.title}</h2>
      <p class="card-summary">${props.pack.summary}</p>
    </div>
    <div class="card-footer">
      <span class="card-tag">${props.pack.specs.mcVersions?.[0] ?? ''} • ${props.pack.specs.loaders?.[0] ?? ''}</span>
      <div class="card-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>
  `;

  // Action listeners
  const triggerClick = () => {
    playClickSound();
    if (props.onClick) {
      props.onClick(props.pack.id);
    }
  };

  card.addEventListener('click', triggerClick);

  card.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerClick();
    }
  });

  return card;
}
