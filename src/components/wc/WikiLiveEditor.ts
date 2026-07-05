/**
 * @file WikiLiveEditor.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Split-pane live markdown editor custom web component.
 *
 * @description
 * Implements a development-only split-screen documentation editor with real-time markdown preview compilation, debounced local storage persistence, and background API synchronization for live content updating.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Modpack } from '../../types.ts';
import { compileMarkdown } from '../../utils/markdown.ts';
import { Button } from '../ui/Button.ts';
import { appLabels } from '../../wiki-data.ts';

// ---------- CLASS: WIKI LIVE EDITOR WEB COMPONENT
/**
 * <wiki-live-editor>, DEV-only split-pane markdown editor.
 *
 * Attributes:
 *   pack-id , the modpack ID
 *   page-id , the page ID
 *
 * Events dispatched:
 *   wiki-editor-close, user clicked "Back to Wiki"
 */
export class WikiLiveEditor extends HTMLElement {
  static observedAttributes = ['pack-id', 'page-id'];

  // ---------- STATE VARIABLES
  private _pack: Modpack | null = null;
  private _rawMarkdown = '';

  // ---------- LIFECYCLE CALLBACKS
  setPack(pack: Modpack) {
    this._pack = pack;
  }

  setRawMarkdown(md: string) {
    this._rawMarkdown = md;
  }

  connectedCallback() {
    this._render();
  }

  // ---------- RENDERING LOGIC
  private _render() {
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

    // ---------- DOM RESET & CONTAINER SETUP (clear contents and apply workspace styles)
    this.innerHTML = '';
    this.className = 'wiki-editor-workspace-container';

    // ---------- TOP NAVIGATION BAR (build header title, exit button, and save status indicator)
    const topBar = document.createElement('div');
    topBar.className = 'wiki-editor-top-bar';

    const editorTitle = document.createElement('div');
    editorTitle.className = 'wiki-editor-title';
    editorTitle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>${appLabels.editWikiPrefix} <span style="color:hsl(var(--primary))">${page.title}</span>`;
    topBar.appendChild(editorTitle);

    const actions = document.createElement('div');
    actions.className = 'wiki-editor-actions';

    const cancelBtn = Button({
      text: 'Back to Wiki',
      variant: 'secondary',
      className: 'editor-btn cancel',
      onClick: () => {
        this.dispatchEvent(new CustomEvent('wiki-editor-close', { bubbles: true }));
      },
    });
    actions.appendChild(cancelBtn);

    const saveStatus = document.createElement('span');
    saveStatus.style.cssText = 'margin-left:1rem;font-size:.85rem;color:hsl(var(--secondary-text))';
    saveStatus.textContent = 'All changes saved locally.';
    actions.appendChild(saveStatus);

    topBar.appendChild(actions);
    this.appendChild(topBar);

    // ---------- SPLIT WORKSPACE MOUNTING (create input textarea and live markdown preview pane)
    const split = document.createElement('div');
    split.className = 'wiki-editor-split';

    const textarea = document.createElement('textarea');
    textarea.className = 'wiki-editor-textarea';
    textarea.placeholder = 'Write or paste your markdown contents here...';
    textarea.value = this._rawMarkdown;

    const preview = document.createElement('div');
    preview.className = 'wiki-editor-preview wiki-body';
    preview.innerHTML = compileMarkdown(this._rawMarkdown);

    // ---------- AUTOSAVE & LIVE COMPILATION (bind debounced input listener for local and server persistence)
    let autoSaveTimeout: ReturnType<typeof setTimeout>;
    textarea.addEventListener('input', () => {
      preview.innerHTML = compileMarkdown(textarea.value);
      saveStatus.textContent = 'Saving...';
      saveStatus.style.color = 'hsl(var(--primary))';

      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        void (async () => {
          try {
            const newMarkdown = textarea.value;
            const res = await fetch('/__wiki_api/save_page', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ modpackId: pack.id, pageId, markdown: newMarkdown }),
            });
            if (res.ok) {
              saveStatus.textContent = 'Saved!';
              saveStatus.style.color = 'hsl(142,70%,45%)';
              localStorage.setItem(`wiki_${pack.id}_${pageId}`, newMarkdown);
              setTimeout(() => {
                saveStatus.textContent = 'All changes saved locally.';
                saveStatus.style.color = 'hsl(var(--secondary-text))';
              }, 2000);
            } else {
              throw new Error('Server error');
            }
          } catch {
            saveStatus.textContent = 'Failed to save!';
            saveStatus.style.color = 'red';
          }
        })();
      }, 1000);
    });

    // ---------- DOM ATTACHMENT & SCROLL RESET (append editor layout and scroll to top)
    split.appendChild(textarea);
    split.appendChild(preview);
    this.appendChild(split);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ---------- WEB COMPONENT REGISTRATION
customElements.define('wiki-live-editor', WikiLiveEditor);
