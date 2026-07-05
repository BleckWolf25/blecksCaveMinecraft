/**
 * @file WikiSpecsPanel.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Project technical specifications and table of contents sidebar custom web component.
 *
 * @description
 * Renders the right-hand metadata panel in the wiki interface displaying project technical specifications (such as mod loaders, supported Minecraft versions, and performance rating pills) and providing a mounting container for dynamically generated article table of contents navigation.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Modpack } from '../../types.ts';
import { appLabels } from '../../wiki-data.ts';

// ---------- CLASS: WIKI SPECS PANEL WEB COMPONENT
/**
 * <wiki-specs-panel>, renders the right-hand specifications and TOC panel.
 *
 * Attributes:
 *   modpack-id, the modpack ID
 */
export class WikiSpecsPanel extends HTMLElement {
  static observedAttributes = ['modpack-id'];

  // ---------- STATE VARIABLES
  private _pack: Modpack | null = null;

  // ---------- LIFECYCLE CALLBACKS
  setPack(pack: Modpack) {
    this._pack = pack;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    // ---------- GUARD CLAUSE (re-render when attributes change if component is mounted)
    if (this.isConnected) {
      this._render();
    }
  }

  // ---------- RENDERING LOGIC
  private _render() {
    const pack = this._pack;
    // ---------- GUARD CLAUSE (verify active project exists)
    if (!pack) {
      return;
    }

    this.innerHTML = '';
    this.className = 'wiki-specs-panel';

    // ---------- PANEL TITLE & CONTAINER SETUP
    const title = document.createElement('h3');
    title.className = 'specs-title';
    title.textContent = appLabels.specsTitle;
    this.appendChild(title);

    // ---------- SPECIFICATIONS GRID (iterate over metadata fields and generate formatted specification pills)
    const grid = document.createElement('div');
    grid.className = 'specs-grid';

    const specLabels: Record<string, string> = {
      version: 'Modpack Version',
      loaders: 'Mod Loader',
      mcVersions: 'Minecraft Version',
      performance: 'Performance Impact',
      focus: 'Primary Focus',
    };

    Object.entries(pack.specs).forEach(([key, value]) => {
      // ---------- GUARD CLAUSE (skip unrecognized specification keys)
      if (!specLabels[key]) {
        return;
      }
      const item = document.createElement('div');
      item.className = 'specs-item';
      item.innerHTML = `
        <span class="specs-label">${specLabels[key]}</span>
        <span class="specs-value specs-value--pills">${renderSpecValue(key, value)}</span>
      `;
      grid.appendChild(item);
    });

    this.appendChild(grid);

    // ---------- TOC PLACEHOLDER (inject navigation container for article table of contents)
    const toc = document.createElement('div');
    toc.className = 'wiki-toc-container';
    this.appendChild(toc);
  }
}

// ---------- SPECIFICATION FORMATTER HELPERS
function renderSpecValue(key: string, value: unknown): string {
  if (key === 'loaders' && Array.isArray(value)) {
    return (value as string[])
      .map((l) => `<span class="spec-pill spec-pill--loader">${l}</span>`)
      .join('');
  }
  if (key === 'mcVersions' && Array.isArray(value)) {
    return (value as string[])
      .map((v) => `<span class="spec-pill spec-pill--version">${v}</span>`)
      .join('');
  }
  return String(value);
}

// ---------- WEB COMPONENT REGISTRATION
customElements.define('wiki-specs-panel', WikiSpecsPanel);
