/**
 * @file WikiArticle.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Compiled markdown documentation reader custom web component.
 *
 * @description
 * Renders documentation pages by loading and compiling raw markdown content into styled HTML, providing interactive table of contents generation, code block clipboard copying, image lightbox viewing, and development edit hooks.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Modpack } from '../../types.ts';
import { compileMarkdown } from '../../utils/markdown.ts';
import { Button } from '../ui/Button.ts';
import { appLabels } from '../../wiki-data.ts';
import { navigateTo } from '../../router.ts';

// ---------- MODULE STATE & REGISTRIES
// Pre-bundle raw markdown files across project directories using Vite glob import query
const mdFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// ---------- MARKDOWN RESOLUTION & UTIL HELPERS
async function loadMarkdown(modpackId: string, pageId: string, pack: Modpack): Promise<string> {
  // ---------- GUARD CLAUSE (return cached user edits when available)
  const cached = localStorage.getItem(`wiki_${modpackId}_${pageId}`);
  if (cached !== null) {
    return cached;
  }

  // Attempt dynamic import from filesystem content bundle
  const mdPath = `../../content/${modpackId}/${pageId}.md`;
  if (mdFiles[mdPath]) {
    try {
      return await mdFiles[mdPath]();
    } catch {
      // Ignore read errors and fall through to inline fallback text
    }
  }
  return pack.pages[pageId]?.contentMarkdown || '> Content missing.';
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ---------- CLASS: WIKI ARTICLE WEB COMPONENT
/**
 * <wiki-article>, displays a compiled markdown page with TOC, lightbox, and copy buttons.
 *
 * Attributes:
 *   pack-id , the modpack ID string
 *   page-id , the page ID string
 *
 * Events dispatched:
 *   wiki-open-editor, user clicked "Edit Page" (detail: { packId, pageId, rawMarkdown })
 */
export class WikiArticle extends HTMLElement {
  static observedAttributes = ['pack-id', 'page-id'];

  // ---------- STATE VARIABLES
  private _pack: Modpack | null = null;

  // ---------- LIFECYCLE CALLBACKS
  /** Called by orchestrator before connecting to DOM */
  setPack(pack: Modpack) {
    this._pack = pack;
  }

  connectedCallback() {
    void this._render();
  }

  attributeChangedCallback() {
    // ---------- GUARD CLAUSE (skip rendering if component is not mounted in DOM)
    if (this.isConnected) {
      void this._render();
    }
  }

  // ---------- RENDERING LOGIC
  private async _render() {
    const pack = this._pack;
    const pageId = this.getAttribute('page-id') ?? '';
    // ---------- GUARD CLAUSE (verify active project and page ID exist)
    if (!pack || !pageId) {
      return;
    }

    const page = pack.pages[pageId];
    // ---------- GUARD CLAUSE (verify target page data exists)
    if (!page) {
      return;
    }

    // ---------- SKELETON PLACEHOLDER (display loading state while fetching markdown)
    this.classList.remove('wiki-panel-animating');
    void this.offsetWidth;
    this.classList.add('wiki-panel-animating');
    this.innerHTML = `
      <div class="wiki-header-container">
        <div class="wiki-skeleton wiki-skeleton--title"></div>
      </div>
      <div class="wiki-body">
        <div class="wiki-skeleton wiki-skeleton--line" style="width:80%"></div>
        <div class="wiki-skeleton wiki-skeleton--line" style="width:60%"></div>
        <div class="wiki-skeleton wiki-skeleton--line" style="width:90%"></div>
        <div class="wiki-skeleton wiki-skeleton--line" style="width:50%"></div>
      </div>
    `;

    // ---------- CONTENT FETCH & COMPILATION (resolve markdown text and parse to HTML)
    const rawMarkdown = await loadMarkdown(pack.id, pageId, pack);
    const compiledHtml = compileMarkdown(rawMarkdown);

    // ---------- HEADER & DEV TOOLS (build title and mount edit button during development)
    const headerContainer = document.createElement('div');
    headerContainer.className = 'wiki-header-container';

    const title = document.createElement('h1');
    title.className = 'wiki-content-title';
    title.style.marginBottom = '0';
    title.textContent = page.title;
    headerContainer.appendChild(title);

    if (import.meta.env?.DEV) {
      const editBtn = Button({
        html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Edit Page',
        variant: 'secondary',
        className: 'wiki-edit-btn',
        onClick: () => {
          this.dispatchEvent(
            new CustomEvent('wiki-open-editor', {
              bubbles: true,
              detail: { packId: pack.id, pageId, rawMarkdown },
            })
          );
        },
      });
      headerContainer.appendChild(editBtn);
    }

    // ---------- BODY & INTERACTIVE ELEMENTS (inject compiled HTML and bind accordion styles)
    const body = document.createElement('div');
    body.className = 'wiki-body';
    body.innerHTML = compiledHtml;

    // Apply custom styling and cursor hints to markdown accordion summaries
    body.querySelectorAll<HTMLElement>('summary').forEach((sum) => {
      sum.style.cursor = 'pointer';
      sum.style.fontWeight = '700';
      sum.style.padding = '0.5rem 0';
      sum.style.color = 'hsl(var(--primary))';
      sum.style.outline = 'none';
    });

    // ---------- LIGHTBOX & CLIPBOARD BINDING (attach image click viewers and copy buttons)
    // Attach click listeners to embeddable images to open lightbox overlay
    body.querySelectorAll<HTMLImageElement>('img[data-lightbox="true"]').forEach((img) => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    // Bind clipboard copy action and feedback icon toggle to code block copy buttons
    body.querySelectorAll<HTMLElement>('.code-copy-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        void (async () => {
          const wrapper = (e.currentTarget as HTMLElement).closest('.code-block-wrapper');
          const codeEl = wrapper?.querySelector('code');
          if (!codeEl) {
            return;
          }
          try {
            await navigator.clipboard.writeText(codeEl.textContent ?? '');
            const orig = btn.innerHTML;
            btn.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = orig;
              btn.classList.remove('copied');
            }, 2000);
          } catch {
            // Ignore clipboard permissions failures in restricted iframe or HTTP environments
          }
        })();
      });
    });

    // ---------- TABLE OF CONTENTS GENERATION (scan headings and populate navigation sidebar)
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
        headers.forEach((h) => {
          const headerEl = h as HTMLElement;
          if (!headerEl.id) {
            headerEl.id = generateId(headerEl.textContent ?? '');
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

    // ---------- DOM MOUNTING & SCROLL RESET (replace skeleton content and scroll to top)
    this.innerHTML = '';
    this.appendChild(headerContainer);
    this.appendChild(body);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ---------- LIGHTBOX MODAL OVERLAY
function openLightbox(src: string, alt: string): void {
  let overlay = document.getElementById('wiki-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'wiki-lightbox';
    overlay.className = 'lightbox-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay?.classList.remove('active'));
  }
  overlay.innerHTML = `
    <div class="lightbox-content">
      <img src="${src}" alt="${alt}" />
      <div class="lightbox-caption">${alt}</div>
    </div>
  `;
  setTimeout(() => overlay?.classList.add('active'), 10);
}

// ---------- WEB COMPONENT REGISTRATION
// Retain router dependency import reference to prevent tree-shaking
void navigateTo;

customElements.define('wiki-article', WikiArticle);
