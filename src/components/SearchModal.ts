/**
 * @file SearchModal.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Global search dialog modal and query indexing engine.
 *
 * @description
 * Implements a lazy-indexed search dialog allowing users to query wiki documentation and project metadata across all modpacks, supporting filtering by mod loader and Minecraft version, keyboard shortcut activation (Ctrl+K), and arrow key results navigation.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { modpacks } from '../wiki-data.ts';
import { Modal } from './ui/Modal.ts';

// ---------- TYPE DEFINITIONS
export interface SearchIndexItem {
  packId: string;
  packTitle: string;
  pageId: string;
  pageTitle: string;
  contentExcerpt: string;
  id: string;
  loaders: string[];
  mcVersions: string[];
}

// ---------- MODULE STATE & DOM REFERENCES
// Retain references to modal instance and active DOM input controls across search sessions
let searchModal: Modal | null = null;
let searchInput: HTMLInputElement | null = null;
let resultsContainer: HTMLElement | null = null;
let activeIndex = 0;
let currentResults: SearchIndexItem[] = [];
let onNavigateCallback: ((packId: string, pageId: string) => void) | null = null;

// Track selected category criteria for filtering search index
const activeFilters = {
  loader: '',
  version: '',
};

// Cache flattened document index and available dropdown options
const searchIndex: SearchIndexItem[] = [];
let allLoaders: string[] = [];
let allVersions: string[] = [];
let isIndexBuilt = false;

// ---------- INDEX BUILDER
function buildSearchIndexLazily(): void {
  // ---------- GUARD CLAUSE (skip generation if already indexed)
  if (isIndexBuilt) {
    return;
  }

  // ---------- INDEX POPULATION (traverse projects and extract document metadata)
  Object.values(modpacks).forEach((pack) => {
    Object.entries(pack.pages).forEach(([pageId, pageData]) => {
      // Ignore category header items that lack body text
      if (pageData.isHeader) {
        return;
      }
      searchIndex.push({
        packId: pack.id,
        packTitle: pack.title,
        pageId: pageId,
        pageTitle: pageData.title,
        contentExcerpt: pageData.contentMarkdown
          ? pageData.contentMarkdown.substring(0, 100).replace(/\n/g, ' ')
          : '',
        id: `${pack.id}/${pageId}`,
        loaders: pack.specs.loaders || [],
        mcVersions: pack.specs.mcVersions || [],
      });
    });
  });

  // ---------- METADATA AGGREGATION (collect unique loaders and version strings)
  allLoaders = [...new Set(searchIndex.flatMap((i) => i.loaders))].sort();
  allVersions = [...new Set(searchIndex.flatMap((i) => i.mcVersions))].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true })
  );

  // ---------- DROPDOWN SYNCHRONIZATION (update select inputs with discovered filter options)
  populateFilterDropdowns();
  isIndexBuilt = true;
}

// ---------- MODAL INITIALIZATION
/**
 * Initializes and mounts the search modal to the body.
 * @param {(packId: string, pageId: string) => void} onNavigate - Callback triggered when a search result is selected.
 */
export function initSearchModal(onNavigate: (packId: string, pageId: string) => void): void {
  onNavigateCallback = onNavigate;

  // ---------- GUARD CLAUSE (prevent duplicate modal instantiation)
  if (searchModal) {
    return;
  }

  // ---------- MODAL CREATION (instantiate dialog wrapper with reset callback)
  searchModal = new Modal({
    ariaLabel: 'Global Wiki Search',
    onClose: () => {
      activeIndex = 0;
      currentResults = [];
    },
  });

  const modalInner = document.createElement('div');
  modalInner.className = 'search-modal-content';

  // ---------- FILTER CONTROLS SETUP (create loader and version select dropdowns)
  const filterRow = document.createElement('div');
  filterRow.className = 'search-filter-row';

  const loaderSelect = document.createElement('select');
  loaderSelect.className = 'search-filter-select';
  loaderSelect.setAttribute('aria-label', 'Filter by mod loader');
  loaderSelect.innerHTML = `<option value="">All Loaders</option>`;

  const versionSelect = document.createElement('select');
  versionSelect.className = 'search-filter-select';
  versionSelect.setAttribute('aria-label', 'Filter by Minecraft version');
  versionSelect.innerHTML = `<option value="">All Versions</option>`;

  loaderSelect.addEventListener('change', () => {
    activeFilters.loader = loaderSelect.value;
    handleSearchInput();
  });
  versionSelect.addEventListener('change', () => {
    activeFilters.version = versionSelect.value;
    handleSearchInput();
  });

  filterRow.appendChild(loaderSelect);
  filterRow.appendChild(versionSelect);

  modalInner.innerHTML = `
    <div class="search-input-wrapper">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="global-search-input" placeholder="Search pages, mods, tutorials... (Esc to close)" autocomplete="off" aria-autocomplete="list" aria-controls="search-results" />
    </div>
  `;
  modalInner.appendChild(filterRow);
  modalInner.insertAdjacentHTML(
    'beforeend',
    `
    <div class="search-results-container" id="search-results" role="listbox"></div>
    <div class="search-footer">
      <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
      <span><kbd>Enter</kbd> to select</span>
    </div>
  `
  );

  searchModal.setContent(modalInner);

  searchInput = modalInner.querySelector('#global-search-input');
  resultsContainer = modalInner.querySelector('#search-results');

  // Event Listeners
  document.addEventListener('keydown', handleGlobalKeydown);
  if (searchInput) {
    searchInput.addEventListener('input', () => handleSearchInput());
    searchInput.addEventListener('keydown', handleInputKeydown);
  }

  // Delegated events for results container
  // ---------- EVENT LISTENER DELEGATION (bind click and hover tracking on results listbox)
  if (resultsContainer) {
    resultsContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.search-result-item') as HTMLElement;
      if (item) {
        const idx = parseInt(item.dataset.index || '-1', 10);
        if (idx >= 0 && currentResults[idx]) {
          selectResult(currentResults[idx]);
        }
      }
    });

    resultsContainer.addEventListener('mousemove', (e) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.search-result-item') as HTMLElement;
      if (item) {
        const idx = parseInt(item.dataset.index || '-1', 10);
        if (idx >= 0 && activeIndex !== idx) {
          activeIndex = idx;
          renderResults();
        }
      }
    });
  }
}

// ---------- KEYBOARD & OPEN/CLOSE HANDLERS
function handleGlobalKeydown(e: KeyboardEvent): void {
  // Intercept Ctrl+K or Cmd+K combination to open search overlay
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
}

function openSearch(): void {
  buildSearchIndexLazily();
  // ---------- GUARD CLAUSE (verify modal and input controls are initialized)
  if (!searchModal || !searchInput) {
    return;
  }

  // ---------- FILTER RESET (clear category selections on dialog launch)
  activeFilters.loader = '';
  activeFilters.version = '';
  const dialogEl = searchModal.getElement();
  if (dialogEl) {
    const loaderSel = dialogEl.querySelector<HTMLSelectElement>('.search-filter-select');
    if (loaderSel) {
      loaderSel.value = '';
    }
    const versionSel = dialogEl.querySelectorAll<HTMLSelectElement>('.search-filter-select')[1];
    if (versionSel) {
      versionSel.value = '';
    }
  }

  searchModal.open();
  searchInput.value = '';
  currentResults = [];
  renderResults();

  // ---------- FOCUS MANAGEMENT (delay focus lock until browser finishes dialog animation)
  setTimeout(() => searchInput?.focus(), 50);
}

function closeSearch(): void {
  searchModal?.close();
}

// ---------- SEARCH QUERY & FILTER EVALUATION
function handleSearchInput(): void {
  // ---------- GUARD CLAUSE (verify input reference exists)
  if (!searchInput) {
    return;
  }

  const query = searchInput.value.toLowerCase().trim();

  // ---------- GUARD CLAUSE (clear list if query and filters are empty)
  if (!query && !activeFilters.loader && !activeFilters.version) {
    currentResults = [];
    renderResults();
    return;
  }

  // ---------- FILTER MATCHING (filter indexed documents against active criteria)
  currentResults = searchIndex
    .filter((item) => {
      // Check mod loader compatibility requirement
      if (activeFilters.loader && !item.loaders.includes(activeFilters.loader)) {
        return false;
      }
      // Check Minecraft version compatibility requirement
      if (activeFilters.version && !item.mcVersions.includes(activeFilters.version)) {
        return false;
      }
      // Evaluate text query against title, project name, or markdown excerpt
      if (query) {
        return (
          item.pageTitle.toLowerCase().includes(query) ||
          item.packTitle.toLowerCase().includes(query) ||
          item.contentExcerpt.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .slice(0, 8);

  activeIndex = 0;
  renderResults();
}

function handleInputKeydown(e: KeyboardEvent): void {
  // ---------- GUARD CLAUSE (ignore arrow navigation if no results exist)
  if (!currentResults.length) {
    return;
  }

  // Handle vertical arrow navigation through result list
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
    const result = currentResults[activeIndex];
    if (result) {
      selectResult(result);
    }
  }
}

function selectResult(result: SearchIndexItem): void {
  closeSearch();
  if (onNavigateCallback) {
    onNavigateCallback(result.packId, result.pageId);
  }
}

// ---------- RESULTS RENDERING & DROPDOWN POPULATION
function renderResults(): void {
  // ---------- GUARD CLAUSE (verify DOM containers exist)
  if (!resultsContainer || !searchInput) {
    return;
  }

  const hasQuery = searchInput.value.trim().length > 0;
  const hasFilter = activeFilters.loader || activeFilters.version;

  resultsContainer.innerHTML = '';

  // ---------- EMPTY STATE HANDLING (display placeholder prompt or missing results message)
  if (!hasQuery && !hasFilter) {
    resultsContainer.innerHTML =
      '<div class="search-empty">Type to start searching, or apply a filter...</div>';
    return;
  }

  if (currentResults.length === 0) {
    resultsContainer.innerHTML = '<div class="search-empty">No results found for your query.</div>';
    return;
  }

  // ---------- RESULT ROW ASSEMBLY (build interactive option cards with badges)
  currentResults.forEach((res, idx) => {
    const item = document.createElement('div');
    item.className = `search-result-item ${idx === activeIndex ? 'active' : ''}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(idx === activeIndex));
    item.dataset.index = String(idx);

    // Build loader and Minecraft version pill badges for visual context
    const loaderBadges = res.loaders
      .slice(0, 2)
      .map((l) => `<span class="search-badge search-badge--loader">${l}</span>`)
      .join('');
    const latestVersion = res.mcVersions.at(-1) ?? '';
    const versionBadge = latestVersion
      ? `<span class="search-badge search-badge--version">${latestVersion}</span>`
      : '';

    item.innerHTML = `
      <div class="search-result-title">${res.pageTitle} <span class="search-result-pack">${res.packTitle}</span></div>
      <div class="search-result-meta">${loaderBadges}${versionBadge}</div>
      <div class="search-result-excerpt">${res.contentExcerpt.substring(0, 80)}...</div>
    `;

    resultsContainer?.appendChild(item);
  });
}

function populateFilterDropdowns(): void {
  const dialogEl = searchModal?.getElement();
  // ---------- GUARD CLAUSE (verify modal dialog exists in DOM)
  if (!dialogEl) {
    return;
  }

  // Populate loader filter dropdown options
  const loaderSelect = dialogEl.querySelector('.search-filter-select[aria-label*="loader"]');
  if (loaderSelect) {
    loaderSelect.innerHTML =
      '<option value="">All Loaders</option>' +
      allLoaders.map((l) => `<option value="${l}">${l}</option>`).join('');
  }

  // Populate Minecraft version filter dropdown options
  const versionSelect = dialogEl.querySelector('.search-filter-select[aria-label*="version"]');
  if (versionSelect) {
    versionSelect.innerHTML =
      '<option value="">All Versions</option>' +
      allVersions.map((v) => `<option value="${v}">${v}</option>`).join('');
  }
}
