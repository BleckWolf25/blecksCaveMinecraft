/**
 * @file WikiSidebar.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Documentation project sidebar navigation custom web component.
 *
 * @description
 * Renders hierarchical documentation navigation links with category headers and page icons, handling routing selection events and providing a development-only interactive drag-and-drop structure editor for reordering pages and categories.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Modpack } from '../../types.ts';
import { Button } from '../ui/Button.ts';
import { navigateTo } from '../../router.ts';
import { PAGE_ICONS, DEFAULT_PAGE_ICON, PACK_ICONS } from '../../utils/icons.ts';

// ---------- CLASS: WIKI SIDEBAR WEB COMPONENT
/**
 * <wiki-sidebar>, sidebar navigation for the wiki view.
 *
 * Attributes:
 *   modpack-id , current modpack ID
 *   active-page, currently active page ID
 *
 * Events dispatched:
 *   wiki-navigate, user clicked a sidebar page (detail: { modpackId, pageId })
 */
export class WikiSidebar extends HTMLElement {
  static observedAttributes = ['modpack-id', 'active-page'];

  // ---------- STATE VARIABLES
  private _pack: Modpack | null = null;
  private _isEditMode = false;
  private _menuEl: HTMLElement | null = null;
  private _menuButtons: Record<string, HTMLButtonElement> = {};

  // ---------- LIFECYCLE CALLBACKS
  setPack(pack: Modpack) {
    this._pack = pack;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // ---------- GUARD CLAUSE (only update if component is connected and value changed)
    if (this.isConnected && oldValue !== newValue) {
      if (name === 'active-page' && this._menuEl && Object.keys(this._menuButtons).length > 0) {
        Object.values(this._menuButtons).forEach((btn) => btn.classList.remove('active'));
        if (this._menuButtons[newValue]) {
          this._menuButtons[newValue].classList.add('active');
        }
      } else {
        this._reRenderMenu();
      }
    }
  }

  // ---------- ATTRIBUTE ACCESSORS
  private _getModpackId() {
    return this.getAttribute('modpack-id') ?? '';
  }

  private _getActivePage() {
    return this.getAttribute('active-page') ?? '';
  }

  // ---------- MAIN RENDERING LOGIC
  private _render() {
    const pack = this._pack;
    // ---------- GUARD CLAUSE (verify target project exists)
    if (!pack) {
      return;
    }

    this.innerHTML = '';

    // ---------- HEADER & DEV TOOLS (build badge, title, and structure edit toggle)
    const header = document.createElement('div');
    header.className = 'wiki-sidebar-header';

    const packIcon =
      PACK_ICONS[pack.id] ??
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';

    header.innerHTML = `
      <span class="wiki-badge">${packIcon} Wiki Database</span>
      <h2 class="wiki-modpack-title">${pack.title}</h2>
    `;

    // DEV-only Edit Structure button
    if (import.meta.env?.DEV) {
      const toggleBtn = Button({
        text: 'Edit Structure',
        variant: 'secondary',
        className: 'editor-btn',
        onClick: () => {
          this._isEditMode = !this._isEditMode;
          toggleBtn.textContent = this._isEditMode ? 'Exit Editor' : 'Edit Structure';
          toggleBtn.style.color = this._isEditMode ? 'hsl(var(--primary))' : '';
          this._reRenderMenu();
        },
      });
      toggleBtn.style.marginTop = '1rem';
      toggleBtn.style.width = '100%';
      header.appendChild(toggleBtn);
    }

    this.appendChild(header);

    // Collapsible Mobile Navigation Toggle Button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'wiki-sidebar-mobile-toggle';
    mobileToggle.innerHTML = `
      <span>Show Navigation Menu</span>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
    this.appendChild(mobileToggle);

    // ---------- MENU CONTAINER (create navigation list element)
    const menu = document.createElement('nav');
    menu.className = 'wiki-sidebar-menu';
    this._menuEl = menu;
    this.appendChild(menu);

    mobileToggle.addEventListener('click', () => {
      const isExpanded = menu.classList.contains('expanded');
      if (isExpanded) {
        menu.classList.remove('expanded');
        mobileToggle.classList.remove('active');
        mobileToggle.querySelector('span')!.textContent = 'Show Navigation Menu';
      } else {
        menu.classList.add('expanded');
        mobileToggle.classList.add('active');
        mobileToggle.querySelector('span')!.textContent = 'Hide Navigation Menu';
      }
    });

    this._reRenderMenu();
  }

  // ---------- MENU DISPATCHER
  private _reRenderMenu() {
    const menu = this._menuEl;
    const pack = this._pack;
    // ---------- GUARD CLAUSE (verify menu container and active project exist)
    if (!menu || !pack) {
      return;
    }

    if (this._isEditMode) {
      this._renderStructureEditor(menu, pack);
    } else {
      this._renderNormalMenu(menu, pack);
    }
  }

  // ---------- STANDARD MENU RENDERING
  private _renderNormalMenu(menu: HTMLElement, pack: Modpack) {
    menu.innerHTML = '';
    this._menuButtons = {};
    const modpackId = this._getModpackId();
    const activePage = this._getActivePage();
    let currentIndent = false;

    Object.entries(pack.pages).forEach(([pageId, pageData]) => {
      // ---------- CATEGORY HEADER RENDERING
      if (pageData.isHeader) {
        currentIndent = true;
        const h = document.createElement('h3');
        h.className = 'wiki-sidebar-category';
        h.textContent = pageData.title;
        h.style.cssText =
          'font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:hsl(var(--secondary-text));margin-top:1.5rem;margin-bottom:.5rem;padding-left:1rem;font-weight:700';
        menu.appendChild(h);
        return;
      }

      // ---------- PAGE NAVIGATION BUTTON RENDERING
      const btn = Button({
        html: `<span class="sidebar-btn-icon">${PAGE_ICONS[pageId] ?? DEFAULT_PAGE_ICON}</span><span class="sidebar-btn-text">${pageData.title}</span>`,
        variant: 'sidebar',
        isActive: pageId === activePage,
        onClick: () => {
          // Collapse mobile menu on link click
          if (menu.classList.contains('expanded')) {
            menu.classList.remove('expanded');
            const toggle = this.querySelector('.wiki-sidebar-mobile-toggle');
            if (toggle) {
              toggle.classList.remove('active');
              const span = toggle.querySelector('span');
              if (span) {
                span.textContent = 'Show Navigation Menu';
              }
            }
          }
          navigateTo(`/${modpackId}/${pageId}`);
        },
      });

      if (currentIndent) {
        btn.classList.add('stairwell-indent');
      }

      this._menuButtons[pageId] = btn;
      menu.appendChild(btn);
    });
  }

  // ---------- STRUCTURE EDITOR RENDERING (DEV ONLY)
  private _renderStructureEditor(menu: HTMLElement, pack: Modpack) {
    menu.innerHTML = '';
    const notice = document.createElement('div');
    notice.style.cssText = 'padding:1rem;font-size:.85rem;color:hsl(var(--secondary-text))';
    notice.textContent = 'Drag or click arrows to reorder. Changes auto-save to structure.json.';
    menu.appendChild(notice);

    const items = Object.entries(pack.pages);

    // ---------- STRUCTURE PERSISTENCE API
    const saveStructure = async () => {
      const newPages: Record<string, unknown> = {};
      items.forEach(([id, data]) => {
        newPages[id] = data;
      });
      pack.pages = newPages as typeof pack.pages;

      // Update globalStructure reference
      const structureRef = (await import('../../content/structure.json')).default as Record<
        string,
        unknown
      >;
      structureRef[pack.id] = newPages;

      try {
        await fetch('/__wiki_api/save_structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ structure: structureRef }),
        });
      } catch (err) {
        console.error('Failed to save structure:', err);
      }
    };

    // ---------- INTERACTIVE LIST RENDERING
    const renderList = () => {
      // Retain notice banner and clear existing interactive item rows
      while (menu.children.length > 1) {
        menu.removeChild(menu.lastChild!);
      }

      let currentIndent = false;
      items.forEach(([_, pageData], index) => {
        if (pageData.isHeader) {
          currentIndent = true;
        }

        const row = document.createElement('div');
        const defaultBorder = pageData.isHeader
          ? '2px solid hsl(var(--primary))'
          : '1px solid hsla(var(--border),.5)';
        row.style.cssText = `display:flex;align-items:center;padding:.5rem;margin-bottom:.5rem;background:${pageData.isHeader ? 'hsla(var(--primary),.1)' : 'hsla(var(--surface),.8)'};border-left:${defaultBorder};border-radius:4px;`;
        if (!pageData.isHeader && currentIndent) {
          row.classList.add('stairwell-indent');
        }

        // ---------- DRAG AND DROP HANDLERS
        row.draggable = true;
        row.ondragstart = (e) => {
          e.dataTransfer?.setData('text/plain', String(index));
          row.style.opacity = '.4';
        };
        row.ondragend = () => {
          row.style.opacity = '1';
        };
        row.ondragover = (e) => {
          e.preventDefault();
          row.style.borderTop = '2px solid hsl(var(--primary))';
        };
        row.ondragleave = () => {
          row.style.borderTop = '';
        };
        row.ondrop = (e) => {
          e.preventDefault();
          row.style.borderTop = '';
          const from = parseInt(e.dataTransfer?.getData('text/plain') ?? '-1', 10);
          if (from >= 0 && from !== index) {
            const [moved] = items.splice(from, 1);
            items.splice(index, 0, moved!);
            void saveStructure();
            renderList();
          }
        };

        const titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'flex:1;font-size:.85rem;color:hsl(var(--primary-text))';
        titleSpan.textContent = pageData.title;

        // ---------- REORDER ARROWS & ITEM LABELS
        const makeArrow = (label: string, onClick: () => void) => {
          const b = document.createElement('button');
          b.textContent = label;
          b.style.cssText =
            'background:transparent;border:none;color:hsl(var(--secondary-text));cursor:pointer;font-size:.9rem;padding:0 .25rem';
          b.onclick = onClick;
          return b;
        };

        row.appendChild(titleSpan);
        if (index > 0) {
          row.appendChild(
            makeArrow('↑', () => {
              [items[index - 1], items[index]] = [items[index]!, items[index - 1]!];
              void saveStructure();
              renderList();
            })
          );
        }
        if (index < items.length - 1) {
          row.appendChild(
            makeArrow('↓', () => {
              [items[index], items[index + 1]] = [items[index + 1]!, items[index]!];
              void saveStructure();
              renderList();
            })
          );
        }

        menu.appendChild(row);
      });

      // ---------- ACTION CONTROLS
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:.5rem;padding:.5rem 0;margin-top:.5rem';

      const addPageBtn = Button({
        text: '+ Page',
        variant: 'secondary',
        className: 'editor-btn',
        onClick: () => {
          const id = prompt('Enter a unique URL slug for the new page:');
          if (!id || items.find((i) => i[0] === id)) {
            return;
          }
          const title = prompt('Enter page title:');
          if (!title) {
            return;
          }
          items.push([id, { title, contentMarkdown: '' }]);
          void saveStructure();
          renderList();
        },
      });

      const addCatBtn = Button({
        text: '+ Category',
        variant: 'secondary',
        className: 'editor-btn',
        onClick: () => {
          const id = 'header-' + Date.now();
          const title = prompt('Enter category title:');
          if (!title) {
            return;
          }
          items.push([id, { title, contentMarkdown: '', isHeader: true }]);
          void saveStructure();
          renderList();
        },
      });

      actions.appendChild(addPageBtn);
      actions.appendChild(addCatBtn);
      menu.appendChild(actions);
    };

    renderList();
  }
}

// ---------- WEB COMPONENT REGISTRATION
customElements.define('wiki-sidebar', WikiSidebar);
