import { modpacks } from '../wiki-data.ts';
import { Modal } from './ui/Modal.ts';

export interface SearchIndexItem {
  packId: string;
  packTitle: string;
  pageId: string;
  pageTitle: string;
  contentExcerpt: string;
  id: string;
}

let searchModal: Modal | null = null;
let searchInput: HTMLInputElement | null = null;
let resultsContainer: HTMLElement | null = null;
let activeIndex = 0;
let currentResults: SearchIndexItem[] = [];
let onNavigateCallback: ((packId: string, pageId: string) => void) | null = null;

/**
 * Builds the searchable index from the raw modpacks data.
 */
function buildSearchIndex(): SearchIndexItem[] {
  const index: SearchIndexItem[] = [];
  Object.values(modpacks).forEach(pack => {
    Object.entries(pack.pages).forEach(([pageId, pageData]) => {
      index.push({
        packId: pack.id,
        packTitle: pack.title,
        pageId: pageId,
        pageTitle: pageData.title,
        contentExcerpt: pageData.contentMarkdown ? pageData.contentMarkdown.substring(0, 100).replace(/\n/g, ' ') : '',
        id: `${pack.id}/${pageId}`
      });
    });
  });
  return index;
}

const searchIndex = buildSearchIndex();

/**
 * Initializes and mounts the search modal to the body.
 * @param {(packId: string, pageId: string) => void} onNavigate - Callback triggered when a search result is selected.
 */
export function initSearchModal(onNavigate: (packId: string, pageId: string) => void): void {
  onNavigateCallback = onNavigate;

  if (searchModal) {return;}

  // Instantiate atomic Modal component
  searchModal = new Modal({
    ariaLabel: 'Global Wiki Search',
    onClose: () => {
      activeIndex = 0;
      currentResults = [];
    }
  });

  const modalInner = document.createElement('div');
  modalInner.className = 'search-modal-content';
  modalInner.innerHTML = `
    <div class="search-input-wrapper">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="global-search-input" placeholder="Search pages, mods, tutorials... (Esc to close)" autocomplete="off" aria-autocomplete="list" aria-controls="search-results" />
    </div>
    <div class="search-results-container" id="search-results" role="listbox"></div>
    <div class="search-footer">
      <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
      <span><kbd>Enter</kbd> to select</span>
    </div>
  `;

  searchModal.setContent(modalInner);

  searchInput = modalInner.querySelector('#global-search-input') as HTMLInputElement;
  resultsContainer = modalInner.querySelector('#search-results') as HTMLElement;

  // Event Listeners
  document.addEventListener('keydown', handleGlobalKeydown);
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('keydown', handleInputKeydown);
}

function handleGlobalKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
}

function openSearch(): void {
  if (!searchModal || !searchInput) {return;}

  searchModal.open();
  searchInput.value = '';
  currentResults = [];
  renderResults();

  // Small delay to ensure focus applies after dialog rendering animation frame
  setTimeout(() => searchInput?.focus(), 50);
}

function closeSearch(): void {
  searchModal?.close();
}

function handleSearchInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  const query = target.value.toLowerCase().trim();
  if (!query) {
    currentResults = [];
    renderResults();
    return;
  }

  // Basic fuzzy/includes search
  currentResults = searchIndex.filter(item => {
    return item.pageTitle.toLowerCase().includes(query) ||
           item.packTitle.toLowerCase().includes(query) ||
           item.contentExcerpt.toLowerCase().includes(query);
  }).slice(0, 8); // limit results to 8

  activeIndex = 0;
  renderResults();
}

function handleInputKeydown(e: KeyboardEvent): void {
  if (!currentResults.length) {return;}

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % currentResults.length;
    renderResults();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
    renderResults();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    selectResult(currentResults[activeIndex]);
  }
}

function selectResult(result: SearchIndexItem): void {
  closeSearch();
  if (onNavigateCallback) {
    onNavigateCallback(result.packId, result.pageId);
  }
}

function renderResults(): void {
  if (!resultsContainer || !searchInput) {return;}

  resultsContainer.innerHTML = '';
  if (!searchInput.value.trim()) {
    resultsContainer.innerHTML = '<div class="search-empty">Type to start searching...</div>';
    return;
  }

  if (currentResults.length === 0) {
    resultsContainer.innerHTML = '<div class="search-empty">No results found for your query.</div>';
    return;
  }

  currentResults.forEach((res, idx) => {
    const item = document.createElement('div');
    item.className = `search-result-item ${idx === activeIndex ? 'active' : ''}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(idx === activeIndex));
    item.innerHTML = `
      <div class="search-result-title">${res.pageTitle} <span class="search-result-pack">${res.packTitle}</span></div>
      <div class="search-result-excerpt">${res.contentExcerpt.substring(0, 60)}...</div>
    `;

    item.addEventListener('click', () => selectResult(res));
    item.addEventListener('mouseenter', () => {
      activeIndex = idx;
      renderResults();
    });

    resultsContainer?.appendChild(item);
  });
}
