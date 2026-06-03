import { modpacks, appLabels } from '../wiki-data.ts';
import { compileMarkdown } from '../utils/markdown.ts';
import { Button } from './ui/Button.ts';
import { Modpack } from '../types.ts';

const mdFiles = import.meta.glob('../content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

let scrollProgressNode: HTMLElement | null = null;
let activeScrollListener: (() => void) | null = null;

// Ensure scroll progress bar exists globally
function initScrollProgress(): void {
  if (!scrollProgressNode) {
    scrollProgressNode = document.createElement('div');
    scrollProgressNode.className = 'scroll-progress-bar';
    document.body.appendChild(scrollProgressNode);
  }
}

// Generate an ID for TOC headers
function generateIdFromText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

/**
 * Retrieves the active markdown content for a given page, checking localStorage cache first.
 */
function getPageMarkdown(modpackId: string, pageId: string, pack: Modpack): string {
  const cached = localStorage.getItem(`wiki_${modpackId}_${pageId}`);
  if (cached !== null) {
    return cached;
  }

  const mdPath = `../content/${modpackId}/${pageId}.md`;
  if (mdFiles[mdPath]) {
    return mdFiles[mdPath];
  }

  return pack.pages[pageId]?.contentMarkdown || '> Content missing.';
}

/**
 * Renders the primary split-pane Wiki workspace.
 * Rebuilt to use modular buttons and full typing specifications.
 */
export function renderWikiView(container: HTMLElement, modpackId: string, initialPageId = 'overview'): void {
  container.innerHTML = '';

  const pack = modpacks[modpackId];
  if (!pack) {
    return;
  }

  let activePageId = initialPageId;

  // 1. Create main wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'wiki-wrapper';

  // 2. Build Left Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'wiki-sidebar';

  // Sidebar header info
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'wiki-sidebar-header';

  let sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';
  if (pack.id === 'velocita-optimized') {
    sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  } else if (pack.id === 'builder-plus-plus') {
    sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/><path d="M12 22V2"/></svg>';
  } else if (pack.id === 'better-than-pvp') {
    sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
  } else if (pack.id === 'aetas-ferrea') {
    sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>';
  } else if (pack.id === 'mc-vanilla-tweaked') {
    sidebarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 21V9"/></svg>';
  }

  sidebarHeader.innerHTML = `
    <span class="wiki-badge">${sidebarIcon} Wiki Database</span>
    <h2 class="wiki-modpack-title">${pack.title}</h2>
  `;
  sidebar.appendChild(sidebarHeader);

  // Sidebar navigation menu
  const menu = document.createElement('nav');
  menu.className = 'wiki-sidebar-menu';

  // 3. Build Central Content Panel (needs to be available for onClick)
  const contentPanel = document.createElement('main');
  contentPanel.className = 'wiki-content-panel';

  let isEditMode = false;
  let menuButtons: Record<string, HTMLButtonElement> = {};

  const renderNormalMenu = () => {
    menu.innerHTML = '';
    menuButtons = {};

    let currentIndent = false;
    Object.entries(pack.pages).forEach(([pageId, pageData]) => {
      if (pageData.isHeader) {
        currentIndent = true;
        const header = document.createElement('h3');
        header.className = 'wiki-sidebar-category';
        header.textContent = pageData.title;
        // Basic styling for the category header
        header.style.fontSize = '0.75rem';
        header.style.textTransform = 'uppercase';
        header.style.letterSpacing = '0.05em';
        header.style.color = 'hsl(var(--secondary-text))';
        header.style.marginTop = '1.5rem';
        header.style.marginBottom = '0.5rem';
        header.style.paddingLeft = '1rem';
        header.style.fontWeight = '700';
        menu.appendChild(header);
        return;
      }

      // Custom subpage SVG icons
      let pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
      if (pageId === 'overview') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
      } else if (pageId === 'features' || pageId === 'mods') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
      } else if (pageId === 'installation') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
      } else if (pageId === 'changelog') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>';
      } else if (pageId === 'notes') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
      } else if (pageId === 'versions') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
      } else if (pageId === 'disclaimer' || pageId === 'modified') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      } else if (pageId === 'technical') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
      } else if (pageId === 'faq') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      } else if (pageId === 'roadmap') {
        pageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>';
      }

      const btn = Button({
        html: `
          <span>${pageIcon}</span>
          <span>${pageData.title}</span>
        `,
        variant: 'sidebar',
        isActive: pageId === activePageId,
        onClick: () => {
          if (activePageId !== pageId) {
            // Update active classes
            menuButtons[activePageId]?.classList.remove('active');
            btn.classList.add('active');
            activePageId = pageId;

            // Render target page content with smooth animation reveal
            renderArticleContent(contentPanel, pack, activePageId);

            // Update URL hash state silently to support bookmarking without full reloads
            window.location.hash = `/${modpackId}/${pageId}`;
          }
        }
      });

      if (currentIndent) {
        btn.style.marginLeft = '1.5rem';
        btn.style.width = 'calc(100% - 1.5rem)';
      }

      menuButtons[pageId] = btn;
      menu.appendChild(btn);
    });
  };

  const renderStructureEditor = () => {
    menu.innerHTML = '';
    const notice = document.createElement('div');
    notice.style.padding = '1rem';
    notice.style.fontSize = '0.85rem';
    notice.style.color = 'hsl(var(--secondary-text))';
    notice.textContent = 'Drag or click arrows to reorder. Changes auto-save to structure.json.';
    menu.appendChild(notice);

    let items = Object.entries(pack.pages);

    const saveStructure = async () => {
      // Rebuild the pages object based on the new array order
      const newPages: Record<string, any> = {};
      items.forEach(([id, data]) => {
        newPages[id] = data;
      });
      // Mutate local pack config
      pack.pages = newPages;

      // Persist to backend (vite.config.ts)
      try {
        // Fetch current global structure first
        const globalStructureRes = await fetch('/src/content/structure.json?t=' + Date.now());
        const globalStructure = await globalStructureRes.json();
        globalStructure[pack.id] = newPages;

        await fetch('/__wiki_api/save_structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ structure: globalStructure })
        });
      } catch (err) {
        console.error('Failed to save structure:', err);
      }
    };

    const renderList = () => {
      menu.innerHTML = '';
      menu.appendChild(notice);

      let currentIndent = false;
      items.forEach(([_, pageData], index) => {
        if (pageData.isHeader) {
          currentIndent = true;
        }

        const itemRow = document.createElement('div');
        itemRow.style.display = 'flex';
        itemRow.style.alignItems = 'center';
        itemRow.style.padding = '0.5rem';
        itemRow.style.marginBottom = '0.5rem';
        itemRow.style.background = pageData.isHeader ? 'hsla(var(--primary), 0.1)' : 'hsla(var(--surface), 0.8)';
        
        const defaultBorder = pageData.isHeader ? '2px solid hsl(var(--primary))' : '1px solid hsla(var(--border), 0.5)';
        itemRow.style.borderLeft = defaultBorder;
        itemRow.style.borderRadius = '4px';

        if (!pageData.isHeader && currentIndent) {
          itemRow.style.marginLeft = '1.5rem';
          itemRow.style.width = 'calc(100% - 1.5rem)';
        }

        // Drag and Drop
        itemRow.draggable = true;
        itemRow.ondragstart = (e) => {
          if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', index.toString());
            e.dataTransfer.effectAllowed = 'move';
          }
          itemRow.style.opacity = '0.4';
        };
        itemRow.ondragend = () => {
          itemRow.style.opacity = '1';
        };
        itemRow.ondragover = (e) => {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          itemRow.style.borderTop = '2px solid hsl(var(--primary))';
        };
        itemRow.ondragleave = () => {
          itemRow.style.borderTop = '';
        };
        itemRow.ondrop = (e) => {
          e.preventDefault();
          itemRow.style.borderTop = '';
          const fromIndexStr = e.dataTransfer?.getData('text/plain');
          if (!fromIndexStr) return;
          const fromIndex = parseInt(fromIndexStr, 10);
          if (fromIndex >= 0 && fromIndex !== index) {
            const temp = items[fromIndex];
            items.splice(fromIndex, 1);
            items.splice(index, 0, temp);
            saveStructure();
            renderList();
          }
        };

        const title = document.createElement('span');
        title.style.flex = '1';
        title.style.fontSize = '0.85rem';
        title.style.color = 'hsl(var(--primary-text))';
        title.textContent = pageData.title;

        // Up arrow
        if (index > 0) {
          const upBtn = document.createElement('button');
          upBtn.innerHTML = '↑';
          upBtn.style.background = 'transparent';
          upBtn.style.border = 'none';
          upBtn.style.color = 'hsl(var(--secondary-text))';
          upBtn.style.cursor = 'pointer';
          upBtn.onclick = () => {
            const temp = items[index - 1];
            items[index - 1] = items[index];
            items[index] = temp;
            saveStructure();
            renderList();
          };
          itemRow.appendChild(upBtn);
        }

        // Down arrow
        if (index < items.length - 1) {
          const downBtn = document.createElement('button');
          downBtn.innerHTML = '↓';
          downBtn.style.background = 'transparent';
          downBtn.style.border = 'none';
          downBtn.style.color = 'hsl(var(--secondary-text))';
          downBtn.style.cursor = 'pointer';
          downBtn.onclick = () => {
            const temp = items[index + 1];
            items[index + 1] = items[index];
            items[index] = temp;
            saveStructure();
            renderList();
          };
          itemRow.appendChild(downBtn);
        }

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '×';
        delBtn.style.background = 'transparent';
        delBtn.style.border = 'none';
        delBtn.style.color = 'red';
        delBtn.style.cursor = 'pointer';
        delBtn.style.marginLeft = '0.5rem';
        delBtn.onclick = () => {
          if (confirm('Are you sure you want to delete this?')) {
            items.splice(index, 1);
            saveStructure();
            renderList();
          }
        };

        itemRow.appendChild(title);
        itemRow.appendChild(delBtn);
        menu.appendChild(itemRow);
      });

      // Add New Buttons
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '0.5rem';
      actions.style.marginTop = '1rem';

      const addPageBtn = Button({
        text: '+ Page',
        variant: 'secondary',
        className: 'editor-btn',
        onClick: () => {
          const id = prompt('Enter a unique URL slug for the new page:');
          if (!id || items.find(i => i[0] === id)) return;
          const title = prompt('Enter page title:');
          if (!title) return;
          items.push([id, { title, contentMarkdown: '' }]);
          saveStructure();
          renderList();
        }
      });
      actions.appendChild(addPageBtn);

      const addCatBtn = Button({
        text: '+ Category',
        variant: 'secondary',
        className: 'editor-btn',
        onClick: () => {
          const id = 'header-' + Date.now();
          const title = prompt('Enter category title:');
          if (!title) return;
          items.push([id, { title, contentMarkdown: '', isHeader: true }]);
          saveStructure();
          renderList();
        }
      });
      actions.appendChild(addCatBtn);
      menu.appendChild(actions);
    };

    renderList();
  };

  // Add Edit Structure Toggle (DEV only)
  if (import.meta.env.DEV) {
    const toggleBtn = Button({
      text: 'Edit Structure',
      variant: 'secondary',
      className: 'editor-btn',
      onClick: () => {
        isEditMode = !isEditMode;
        if (isEditMode) {
          toggleBtn.textContent = 'Exit Editor';
          toggleBtn.style.color = 'hsl(var(--primary))';
          renderStructureEditor();
        } else {
          toggleBtn.textContent = 'Edit Structure';
          toggleBtn.style.color = '';
          renderNormalMenu();
        }
      }
    });
    toggleBtn.style.marginTop = '1rem';
    toggleBtn.style.width = '100%';
    sidebarHeader.appendChild(toggleBtn);
  }

  // Initial render
  renderNormalMenu();

  sidebar.appendChild(menu);
  wrapper.appendChild(sidebar);

  wrapper.appendChild(contentPanel);

  // Render initial page contents
  renderArticleContent(contentPanel, pack, activePageId);

  // 4. Build Right Specifications Panel
  const specsPanel = document.createElement('aside');
  specsPanel.className = 'wiki-specs-panel';

  const specsTitle = document.createElement('h3');
  specsTitle.className = 'specs-title';
  specsTitle.textContent = appLabels.specsTitle;
  specsPanel.appendChild(specsTitle);

  const specsGrid = document.createElement('div');
  specsGrid.className = 'specs-grid';

  const specLabels: Record<string, string> = {
    version: 'Modpack Version',
    loaders: 'Mod Loader',
    mcVersions: 'Minecraft Version',
    performance: 'Performance Impact',
    focus: 'Primary Focus'
  };

  // Custom renderers for array-type spec fields
  function renderSpecValue(key: string, value: unknown): string {
    if (key === 'loaders' && Array.isArray(value)) {
      return value.map(l => `<span class="spec-pill spec-pill--loader">${l}</span>`).join('');
    }
    if (key === 'mcVersions' && Array.isArray(value)) {
      return value.map(v => `<span class="spec-pill spec-pill--version">${v}</span>`).join('');
    }
    return String(value);
  }

  Object.entries(pack.specs).forEach(([key, value]) => {
    if (!specLabels[key]) {return;} // skip unknown keys
    const item = document.createElement('div');
    item.className = 'specs-item';
    item.innerHTML = `
      <span class="specs-label">${specLabels[key]}</span>
      <span class="specs-value specs-value--pills">${renderSpecValue(key, value)}</span>
    `;
    specsGrid.appendChild(item);
  });

  specsPanel.appendChild(specsGrid);

  // 5. Dynamic Table of Contents Container
  const tocContainer = document.createElement('div');
  tocContainer.className = 'wiki-toc-container';
  specsPanel.appendChild(tocContainer);

  wrapper.appendChild(specsPanel);

  container.appendChild(wrapper);

  // Expose the global scroll listener setup
  initScrollProgress();
  if (activeScrollListener) {
    window.removeEventListener('scroll', activeScrollListener);
  }

  activeScrollListener = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (scrollProgressNode) {
      scrollProgressNode.style.width = scrolled + '%';
    }
  };
  window.addEventListener('scroll', activeScrollListener);
}

/**
 * Updates the central content panel with the active compiled article text.
 */
function renderArticleContent(panel: HTMLElement, pack: Modpack, pageId: string): void {
  const page = pack.pages[pageId];
  if (!page) {
    return;
  }

  // Clear previous panel data and re-trigger animation
  panel.classList.remove('wiki-panel-animating');
  void panel.offsetWidth; // Force a browser reflow
  panel.classList.add('wiki-panel-animating');
  panel.innerHTML = '';

  // Get raw markdown from cache or default configurations
  const rawMarkdown = getPageMarkdown(pack.id, pageId, pack);
  const compiledHtml = compileMarkdown(rawMarkdown);

  // Re-build standard view with header flex-box containing Edit Button
  const headerContainer = document.createElement('div');
  headerContainer.className = 'wiki-header-container';

  const title = document.createElement('h1');
  title.className = 'wiki-content-title';
  title.style.marginBottom = '0';
  title.textContent = page.title;
  headerContainer.appendChild(title);

  // Rebuilt using modular Button element (DEV only)
  if (import.meta.env.DEV) {
    const editBtn = Button({
      html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Edit Page',
      variant: 'secondary',
      className: 'wiki-edit-btn',
      onClick: () => {
        renderLiveEditor(panel, pack, pageId, rawMarkdown);
      }
    });
    headerContainer.appendChild(editBtn);
  }
  
  panel.appendChild(headerContainer);

  const body = document.createElement('div');
  body.className = 'wiki-body';
  body.innerHTML = compiledHtml;

  // Custom disclosure accordions logic
  const summaries = body.querySelectorAll('summary');
  summaries.forEach(sum => {
    sum.style.cursor = 'pointer';
    sum.style.fontWeight = '700';
    sum.style.padding = '0.5rem 0';
    sum.style.color = 'hsl(var(--primary))';
    sum.style.outline = 'none';
  });

  // Setup Lightboxes
  const images = body.querySelectorAll('img[data-lightbox="true"]');
  images.forEach(img => {
    img.addEventListener('click', () => {
      openLightbox((img as HTMLImageElement).src, (img as HTMLImageElement).alt);
    });
  });

  // Setup Copy Buttons
  const copyBtns = body.querySelectorAll('.code-copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const currentTarget = e.currentTarget as HTMLElement;
      const codeWrapper = currentTarget.closest('.code-block-wrapper');
      if (!codeWrapper) {return;}
      const codeEl = codeWrapper.querySelector('code');
      if (!codeEl) {return;}
      try {
        await navigator.clipboard.writeText(codeEl.textContent || '');
        const originalHtml = currentTarget.innerHTML;
        currentTarget.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        currentTarget.classList.add('copied');
        setTimeout(() => {
          currentTarget.innerHTML = originalHtml;
          currentTarget.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  });

  // Generate Table of Contents
  const tocContainer = document.querySelector('.wiki-toc-container');
  if (tocContainer) {
    tocContainer.innerHTML = '';
    const headers = body.querySelectorAll('h2, h3');
    if (headers.length > 0) {
      const tocTitle = document.createElement('h3');
      tocTitle.className = 'specs-title';
      tocTitle.textContent = appLabels.tocTitle;
      tocTitle.style.marginTop = '2rem';
      tocContainer.appendChild(tocTitle);

      const tocList = document.createElement('ul');
      tocList.className = 'wiki-toc-list';
      headers.forEach(h => {
        const headerEl = h as HTMLElement;
        if (!headerEl.id) {
          headerEl.id = generateIdFromText(headerEl.textContent || '');
        }
        const li = document.createElement('li');
        li.className = `toc-item toc-${headerEl.tagName.toLowerCase()}`;
        const a = document.createElement('a');
        a.href = `#${headerEl.id}`;
        a.textContent = headerEl.textContent;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          headerEl.scrollIntoView({ behavior: 'smooth' });
        });
        li.appendChild(a);
        tocList.appendChild(li);
      });
      tocContainer.appendChild(tocList);
    }
  }

  panel.appendChild(body);

  // Trigger dynamic scroll reset to the top of the article
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (scrollProgressNode) {
    scrollProgressNode.style.width = '0%';
  }
}

/**
 * Creates and displays a full-screen image lightbox.
 */
function openLightbox(src: string, alt: string): void {
  let overlay = document.getElementById('wiki-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'wiki-lightbox';
    overlay.className = 'lightbox-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      overlay?.classList.remove('active');
    });
  }

  overlay.innerHTML = `
    <div class="lightbox-content">
      <img src="${src}" alt="${alt}" />
      <div class="lightbox-caption">${alt}</div>
    </div>
  `;

  // Use timeout to allow CSS transition to catch the class addition
  setTimeout(() => {
    overlay?.classList.add('active');
  }, 10);
}

/**
 * Renders the dual-pane live markdown editor inside the content panel.
 */
function renderLiveEditor(panel: HTMLElement, pack: Modpack, pageId: string, rawMarkdown: string): void {
  const page = pack.pages[pageId];
  if (!page) {
    return;
  }

  // Clear reading view
  panel.innerHTML = '';

  const editorContainer = document.createElement('div');
  editorContainer.className = 'wiki-editor-workspace-container';

  // 1. Build Top Bar (Header & Actions)
  const topBar = document.createElement('div');
  topBar.className = 'wiki-editor-top-bar';

  const editorTitle = document.createElement('div');
  editorTitle.className = 'wiki-editor-title';
  editorTitle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ${appLabels.editWikiPrefix} <span style="color: hsl(var(--primary));">${page.title}</span>`;
  topBar.appendChild(editorTitle);

  const actions = document.createElement('div');
  actions.className = 'wiki-editor-actions';

  // Cancel Button (modular)
  const cancelBtn = Button({
    text: 'Back to Wiki',
    variant: 'secondary',
    className: 'editor-btn cancel',
    onClick: () => {
      renderArticleContent(panel, pack, pageId);
    }
  });
  actions.appendChild(cancelBtn);

  // Auto-Save Indicator
  const saveStatus = document.createElement('span');
  saveStatus.style.marginLeft = '1rem';
  saveStatus.style.fontSize = '0.85rem';
  saveStatus.style.color = 'hsl(var(--secondary-text))';
  saveStatus.textContent = 'All changes saved locally.';
  actions.appendChild(saveStatus);

  topBar.appendChild(actions);
  editorContainer.appendChild(topBar);

  // 2. Build Split Workspace Panel (Textarea on Left, Live Preview on Right)
  const splitPanel = document.createElement('div');
  splitPanel.className = 'wiki-editor-split';

  const textarea = document.createElement('textarea');
  textarea.className = 'wiki-editor-textarea';
  textarea.placeholder = 'Write or paste your markdown contents here...';
  textarea.value = rawMarkdown;
  splitPanel.appendChild(textarea);

  const preview = document.createElement('div');
  preview.className = 'wiki-editor-preview wiki-body';
  preview.innerHTML = compileMarkdown(rawMarkdown);
  splitPanel.appendChild(preview);

  // Real-time dynamic preview compiler input handler & auto-save
  let autoSaveTimeout: ReturnType<typeof setTimeout>;
  
  textarea.addEventListener('input', () => {
    preview.innerHTML = compileMarkdown(textarea.value);
    
    saveStatus.textContent = 'Saving...';
    saveStatus.style.color = 'hsl(var(--primary))';
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
      try {
        const newMarkdown = textarea.value;
        const res = await fetch('/__wiki_api/save_page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modpackId: pack.id, pageId, markdown: newMarkdown })
        });
        
        if (res.ok) {
          saveStatus.textContent = 'Saved!';
          saveStatus.style.color = 'hsl(142, 70%, 45%)'; // Success green
          // Update the runtime local memory so if we click "Back to Wiki", it loads properly
          // Note: we might need to update the actual mdFiles cache, but it's immutable in Vite.
          // Wait, Vite HMR might reload the page automatically when .md files change!
          // So we don't even need to mock cache if Vite reloads it! But let's cache it just in case.
          localStorage.setItem(`wiki_${pack.id}_${pageId}`, newMarkdown);
          setTimeout(() => {
            saveStatus.textContent = 'All changes saved locally.';
            saveStatus.style.color = 'hsl(var(--secondary-text))';
          }, 2000);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        saveStatus.textContent = 'Failed to save!';
        saveStatus.style.color = 'red';
      }
    }, 1000);
  });

  editorContainer.appendChild(splitPanel);
  panel.appendChild(editorContainer);

  // Trigger dynamic scroll reset to the top of the editor
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
