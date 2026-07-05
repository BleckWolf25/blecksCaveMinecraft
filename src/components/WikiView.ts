/**
 * @file WikiView.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Split-panel wiki documentation layout orchestrator.
 *
 * @description
 * Orchestrates the three-column wiki layout by mounting and linking custom web components (sidebar navigation, markdown article reader, and technical specifications panel), managing reading scroll progress indicators, and dynamically loading the live markdown editor during development sessions.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { modpacks } from '../wiki-data.ts';
import './wc/WikiSidebar.ts';
import './wc/WikiArticle.ts';
import './wc/WikiSpecsPanel.ts';

// ---------- DEVELOPMENT ENVIRONMENT SETUP
// Dynamically import live markdown editor only in development builds (tree-shaken in production)
if (import.meta.env?.DEV) {
  void import('./wc/WikiLiveEditor.ts');
}

// ---------- MODULE STATE & DOM REFERENCES
let scrollProgressNode: HTMLElement | null = null;
let activeScrollListener: (() => void) | null = null;
let scrollAnimationFrame: number | null = null;

// ---------- SCROLL INDICATOR MANAGEMENT
function initScrollProgress(): void {
  // ---------- GUARD CLAUSE (prevent duplicate scroll progress bar creation)
  if (scrollProgressNode) {
    return;
  }
  scrollProgressNode = document.createElement('div');
  scrollProgressNode.className = 'scroll-progress-bar';
  document.body.appendChild(scrollProgressNode);
}

// ---------- COMPONENT: WIKI VIEW WORKSPACE
/**
 * Renders the primary split-pane Wiki workspace using Web Components.
 * @param {HTMLElement} container - Target DOM container to render into.
 * @param {string} modpackId - ID of the selected modpack project.
 * @param {string} [initialPageId='overview'] - ID of the page to open initially.
 */
export function renderWikiView(
  container: HTMLElement,
  modpackId: string,
  initialPageId = 'overview'
): void {
  const pack = modpacks[modpackId];
  // ---------- GUARD CLAUSE (verify target project exists in catalog)
  if (!pack) {
    return;
  }

  // ---------- SMART PAGE UPDATE (preserve DOM and sidebar scroll state if within same modpack)
  const existingSidebar = container.querySelector('wiki-sidebar');
  const existingArticle = container.querySelector('wiki-article');
  if (
    existingSidebar &&
    existingArticle &&
    existingSidebar.getAttribute('modpack-id') === modpackId
  ) {
    existingSidebar.setAttribute('active-page', initialPageId);
    existingArticle.setAttribute('page-id', initialPageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  container.innerHTML = '';

  // ---------- DOM ASSEMBLY (create layout wrapper and instantiate sidebar web component)
  const wrapper = document.createElement('div');
  wrapper.className = 'wiki-wrapper';

  // Instantiate sidebar custom element and cast to call custom setter methods before upgrade
  const sidebar = document.createElement('wiki-sidebar') as HTMLElement & {
    setPack: (p: typeof pack) => void;
    setAttribute: (name: string, value: string) => void;
  };
  (sidebar as unknown as { setPack: (p: typeof pack) => void }).setPack(pack);
  sidebar.setAttribute('modpack-id', modpackId);
  sidebar.setAttribute('active-page', initialPageId);
  sidebar.className = 'wiki-sidebar';
  sidebar.setAttribute('tabindex', '0');
  sidebar.setAttribute('aria-label', 'Wiki Sidebar Navigation');

  // ---------- ARTICLE & SPECS MOUNTING (instantiate content reader and specifications panel)
  const contentPanel = document.createElement('main');
  contentPanel.className = 'wiki-content-panel';

  const article = document.createElement('wiki-article') as HTMLElement & {
    setPack: (p: typeof pack) => void;
  };
  (article as unknown as { setPack: (p: typeof pack) => void }).setPack(pack);
  article.setAttribute('pack-id', modpackId);
  article.setAttribute('page-id', initialPageId);
  contentPanel.appendChild(article);

  // Instantiate technical specification sidebar panel
  const specsPanel = document.createElement('wiki-specs-panel') as HTMLElement & {
    setPack: (p: typeof pack) => void;
  };
  (specsPanel as unknown as { setPack: (p: typeof pack) => void }).setPack(pack);
  specsPanel.setAttribute('modpack-id', modpackId);
  specsPanel.setAttribute('tabindex', '0');
  specsPanel.setAttribute('aria-label', 'Wiki Technical Specifications Panel');

  // ---------- LIVE EDITOR HOOKS (bind development editor launcher on article edit requests)
  if (import.meta.env?.DEV) {
    article.addEventListener('wiki-open-editor', (e) => {
      void (async () => {
        const { pageId, rawMarkdown } = (
          e as CustomEvent<{ packId: string; pageId: string; rawMarkdown: string }>
        ).detail;

        const { WikiLiveEditor } = await import('./wc/WikiLiveEditor.ts');
        if (!customElements.get('wiki-live-editor')) {
          customElements.define('wiki-live-editor', WikiLiveEditor);
        }

        const editor = document.createElement('wiki-live-editor') as HTMLElement & {
          setPack: (p: typeof pack) => void;
          setRawMarkdown: (md: string) => void;
        };
        (editor as unknown as { setPack: (p: typeof pack) => void }).setPack(pack);
        (editor as unknown as { setRawMarkdown: (md: string) => void }).setRawMarkdown(rawMarkdown);
        editor.setAttribute('pack-id', modpackId);
        editor.setAttribute('page-id', pageId);

        // Bind editor dismissal event to restore standard article reading view
        editor.addEventListener('wiki-editor-close', () => {
          contentPanel.innerHTML = '';
          contentPanel.appendChild(article);
          article.setAttribute('page-id', pageId);
        });

        contentPanel.innerHTML = '';
        contentPanel.appendChild(editor);
      })();
    });
  }

  // ---------- DOM ATTACHMENT & SCROLL TRACKING (inject completed layout and bind window scroll listener)
  wrapper.appendChild(sidebar);
  wrapper.appendChild(contentPanel);
  wrapper.appendChild(specsPanel);
  container.appendChild(wrapper);

  // Initialize reading progress indicator and attach throttled scroll event handler
  initScrollProgress();
  if (activeScrollListener) {
    window.removeEventListener('scroll', activeScrollListener);
  }
  if (scrollAnimationFrame !== null) {
    cancelAnimationFrame(scrollAnimationFrame);
  }

  activeScrollListener = () => {
    // ---------- GUARD CLAUSE (skip scroll calculation if animation frame is already pending)
    if (scrollAnimationFrame !== null) {
      return;
    }

    scrollAnimationFrame = requestAnimationFrame(() => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      if (scrollProgressNode) {
        scrollProgressNode.style.width = `${scrolled}%`;
      }
      scrollAnimationFrame = null;
    });
  };
  window.addEventListener('scroll', activeScrollListener);
}
