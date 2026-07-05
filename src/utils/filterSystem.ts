/**
 * @file filterSystem.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Dynamic category tab and multi-attribute filter system for project grids.
 *
 * @description
 * Implements the interactive project filtering workspace for the portal catalog, managing category navigation tabs, dynamic sub-filter buttons (such as mod loaders, resolutions, and Minecraft versions), archived project toggles, and state evaluation for grid rendering.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { Button } from '../components/ui/Button.ts';
import { Modpack, ProjectType } from '../types.ts';
import { modpacks } from '../wiki-data.ts';

// ---------- INTERFACES & TYPE DEFINITIONS
export interface FilterState {
  activeTab: 'all' | ProjectType;
  categories: Set<string>;
  loaders: Set<string>;
  resolutions: Set<string>;
  versions: Set<string>;
  showArchived: boolean;
}

export interface FilterConfig {
  container: HTMLElement;
  onFilterChange: () => void;
}

// ---------- FILTER SYSTEM INITIALIZATION
/**
 * Initialize and build the filter system UI with Category Navigation Tabs
 */
export function initFilterSystem(config: FilterConfig): {
  filterSection: HTMLElement;
  applyFilter: () => void;
  packMatchesFilters: (pack: Modpack) => boolean;
  getActiveTab: () => string;
} {
  const { container, onFilterChange } = config;

  // ---------- STATE & OPTION REGISTRIES
  const filterState: FilterState = {
    activeTab: 'all',
    categories: new Set<string>(),
    loaders: new Set<string>(),
    resolutions: new Set<string>(),
    versions: new Set<string>(),
    showArchived: false,
  };

  // Derive all unique filter options from data catalog
  const allLoaders = new Set<string>();
  const allVersions = new Set<string>();
  const allResolutions = new Set<string>();

  Object.values(modpacks).forEach(pack => {
    pack.specs.loaders?.forEach(l => allLoaders.add(l));
    pack.specs.mcVersions?.forEach(v => allVersions.add(v));
    if (pack.specs.resolution) {
      allResolutions.add(pack.specs.resolution);
    }
  });

  const sortedLoaders = Array.from(allLoaders).sort();
  const sortedResolutions = Array.from(allResolutions).sort();
  const sortedVersions = Array.from(allVersions).sort((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true });
  });

  const filterSection = document.createElement('div');
  filterSection.className = 'portal-filter-section';

  // ---------- CATEGORY NAVIGATION TABS
  const categoryTabs = document.createElement('nav');
  categoryTabs.className = 'portal-category-tabs';
  categoryTabs.setAttribute('role', 'tablist');

  const tabsData: { id: 'all' | ProjectType; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'modpack', label: 'Modpacks' },
    { id: 'mod', label: 'Mods' },
    { id: 'resource-pack', label: 'Resource Packs' },
    { id: 'shader', label: 'Shaders' },
  ];

  const tabButtonsMap = new Map<string, HTMLButtonElement>();

  // ---------- TAB BADGE COMPUTATION
  function computeTabCounts(): Record<string, number> {
    const counts: Record<string, number> = { all: 0, modpack: 0, mod: 0, 'resource-pack': 0, shader: 0 };
    Object.values(modpacks).forEach(pack => {
      // ---------- GUARD CLAUSE (ignore archived projects unless toggle is active)
      if (pack.isArchived && !filterState.showArchived) {
        return;
      }
      counts['all'] = (counts['all'] || 0) + 1;
      const type = pack.type || 'modpack';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  function updateTabBadges() {
    const counts = computeTabCounts();
    tabsData.forEach(t => {
      const btn = tabButtonsMap.get(t.id);
      if (btn) {
        const badge = btn.querySelector('.tab-count');
        if (badge) {
          badge.textContent = String(counts[t.id] || 0);
        }
      }
    });
  }

  tabsData.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `category-tab-btn ${t.id === 'all' ? 'active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', t.id === 'all' ? 'true' : 'false');
    btn.innerHTML = `<span>${t.label}</span><span class="tab-count">0</span>`;

    btn.addEventListener('click', () => {
      // ---------- GUARD CLAUSE (ignore clicks on already active category tab)
      if (filterState.activeTab === t.id) {
        return;
      }
      filterState.activeTab = t.id;

      tabButtonsMap.forEach((b, key) => {
        const isActive = key === t.id;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Reset sub-filter selections when switching category
      filterState.categories.clear();
      filterState.loaders.clear();
      filterState.resolutions.clear();
      filterState.versions.clear();
      toggleBtnMap.forEach(toggleBtn => {
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-pressed', 'false');
      });
      updateGroupBadge(loaderGroup, 0);
      updateGroupBadge(resolutionGroup, 0);
      updateGroupBadge(versionGroup, 0);

      updateFilterPillVisibility();
      applyFilter();
    });

    tabButtonsMap.set(t.id, btn);
    categoryTabs.appendChild(btn);
  });

  filterSection.appendChild(categoryTabs);

  // -------------------------------------------------------------------------
  // ---------- DYNAMIC FILTER GROUPS
  const filterGroupsRow = document.createElement('div');
  filterGroupsRow.className = 'portal-filter-groups';

  const toggleBtnMap = new Map<string, HTMLButtonElement>();

  function updateGroupBadge(groupEl: HTMLElement, count: number) {
    const badge = groupEl.querySelector<HTMLElement>('.filter-group-badge');
    // ---------- GUARD CLAUSE (ignore badge updates if element is unmounted)
    if (!badge) {
      return;
    }
    badge.textContent = count > 0 ? String(count) : '';
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  // ---------- GROUP UI BUILDER
  function buildFilterGroup(
    options: string[],
    stateSet: Set<string>,
    groupKey: string,
    groupEl: HTMLElement
  ) {
    const btnRow = document.createElement('div');
    btnRow.className = 'filter-group-btns';

    options.forEach(opt => {
      const btn = Button({
        text: opt,
        variant: 'filter',
        className: `ui-btn-filter filter-opt-${opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        onClick: () => {
          if (stateSet.has(opt)) {
            stateSet.delete(opt);
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
          } else {
            stateSet.add(opt);
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          }
          updateGroupBadge(groupEl, stateSet.size);
          applyFilter();
        }
      });
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.filterKey = `${groupKey}:${opt}`;
      toggleBtnMap.set(`${groupKey}:${opt}`, btn);
      btnRow.appendChild(btn);
    });

    groupEl.appendChild(btnRow);
  }

  // ---------- SPECIFIC FILTER GROUP INSTANTIATION

  // --- Loader Group ---
  const loaderGroup = document.createElement('div');
  loaderGroup.className = 'filter-group filter-group-loaders';
  loaderGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">Loader</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedLoaders, filterState.loaders, 'loader', loaderGroup);
  filterGroupsRow.appendChild(loaderGroup);

  // --- Resolution Group (for Resource Packs) ---
  const resolutionGroup = document.createElement('div');
  resolutionGroup.className = 'filter-group filter-group-resolutions';
  resolutionGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">Resolution</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedResolutions, filterState.resolutions, 'res', resolutionGroup);
  filterGroupsRow.appendChild(resolutionGroup);

  // --- MC Version Group ---
  const versionGroup = document.createElement('div');
  versionGroup.className = 'filter-group filter-group-versions';
  versionGroup.innerHTML = `
    <div class="filter-group-header">
      <span class="filter-group-label">MC Version</span>
      <span class="filter-group-badge" style="display:none"></span>
    </div>
  `;
  buildFilterGroup(sortedVersions, filterState.versions, 'ver', versionGroup);
  filterGroupsRow.appendChild(versionGroup);

  // ---------- COMPATIBILITY & GROUP VISIBILITY UPDATE FUNCTION
  function updateFilterPillVisibility() {
    const compatibleLoaders = new Set<string>();
    const compatibleVersions = new Set<string>();
    const compatibleResolutions = new Set<string>();

    Object.values(modpacks).forEach(pack => {
      if (pack.isArchived && !filterState.showArchived) {
        return;
      }
      if (filterState.activeTab === 'all' || (pack.type || 'modpack') === filterState.activeTab) {
        pack.specs.loaders?.forEach(l => compatibleLoaders.add(l));
        pack.specs.mcVersions?.forEach(v => compatibleVersions.add(v));
        if (pack.specs.resolution) {
          compatibleResolutions.add(pack.specs.resolution);
        }
      }
    });

    toggleBtnMap.forEach((btn, key) => {
      const [groupKey, value] = key.split(':');
      let isCompatible = false;

      if (groupKey === 'loader') {
        isCompatible = compatibleLoaders.has(value);
      } else if (groupKey === 'res') {
        isCompatible = compatibleResolutions.has(value);
      } else if (groupKey === 'ver') {
        isCompatible = compatibleVersions.has(value);
      }

      btn.style.display = isCompatible ? 'inline-flex' : 'none';

      // Auto-clear incompatible selections
      if (!isCompatible && btn.classList.contains('active')) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        if (groupKey === 'loader') filterState.loaders.delete(value);
        if (groupKey === 'res') filterState.resolutions.delete(value);
        if (groupKey === 'ver') filterState.versions.delete(value);
      }
    });

    // Update badges
    updateGroupBadge(loaderGroup, filterState.loaders.size);
    updateGroupBadge(resolutionGroup, filterState.resolutions.size);
    updateGroupBadge(versionGroup, filterState.versions.size);

    // Hide entire groups if no options are compatible at all
    loaderGroup.style.display = ((filterState.activeTab === 'all' || filterState.activeTab === 'modpack' || filterState.activeTab === 'mod') && compatibleLoaders.size > 0) ? 'block' : 'none';
    resolutionGroup.style.display = (filterState.activeTab === 'resource-pack' && compatibleResolutions.size > 0) ? 'block' : 'none';
    versionGroup.style.display = (compatibleVersions.size > 0) ? 'block' : 'none';
  }

  updateFilterPillVisibility();
  filterSection.appendChild(filterGroupsRow);

  // ---------- ARCHIVED TOGGLE & RESET CONTROLS
  const filterMeta = document.createElement('div');
  filterMeta.className = 'portal-filter-meta';

  const archiveLabel = document.createElement('label');
  archiveLabel.className = 'filter-archive-toggle';
  archiveLabel.innerHTML = `
    <input type="checkbox" id="filter-archived-toggle" />
    <span>Show archived projects</span>
  `;
  const archiveCheckbox = archiveLabel.querySelector('input') as HTMLInputElement;
  archiveCheckbox.addEventListener('change', () => {
    filterState.showArchived = archiveCheckbox.checked;
    updateTabBadges();
    updateFilterPillVisibility();
    applyFilter();
  });
  filterMeta.appendChild(archiveLabel);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'filter-reset-btn';
  resetBtn.textContent = 'Reset filters';
  resetBtn.addEventListener('click', () => {
    filterState.categories.clear();
    filterState.loaders.clear();
    filterState.resolutions.clear();
    filterState.versions.clear();
    filterState.showArchived = false;
    archiveCheckbox.checked = false;
    toggleBtnMap.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    updateGroupBadge(loaderGroup, 0);
    updateGroupBadge(resolutionGroup, 0);
    updateGroupBadge(versionGroup, 0);
    updateTabBadges();
    updateFilterPillVisibility();
    applyFilter();
  });
  filterMeta.appendChild(resetBtn);

  filterSection.appendChild(filterMeta);
  container.appendChild(filterSection);

  updateTabBadges();

  // ---------- FILTER MATCHING LOGIC
  /**
   * Check if a pack matches the current tab and filters
   */
  function packMatchesFilters(pack: Modpack): boolean {
    // ---------- GUARD CLAUSES (check tab type and archived status)
    if (filterState.activeTab !== 'all' && (pack.type || 'modpack') !== filterState.activeTab) {
      return false;
    }

    if (pack.isArchived && !filterState.showArchived) {
      return false;
    }

    // ---------- LOADER EVALUATION

    if (filterState.loaders.size > 0 && (filterState.activeTab === 'all' || filterState.activeTab === 'modpack' || filterState.activeTab === 'mod')) {
      const packLoaders = pack.specs.loaders || [];
      const matchesLoader = packLoaders.some(l => filterState.loaders.has(l));
      if (!matchesLoader) {
        return false;
      }
    }

    // ---------- RESOLUTION & VERSION EVALUATION
    if (filterState.resolutions.size > 0 && (filterState.activeTab === 'all' || filterState.activeTab === 'resource-pack')) {
      if (!filterState.resolutions.has(pack.specs.resolution || '')) {
        return false;
      }
    }

    if (filterState.versions.size > 0) {
      const packVersions = pack.specs.mcVersions || [];
      const matchesVersion = packVersions.some(v => filterState.versions.has(v));
      if (!matchesVersion) {
        return false;
      }
    }

    return true;
  }

  // ---------- FILTER DISPATCHER & EXPORTS
  function applyFilter() {
    updateTabBadges();
    onFilterChange();
  }

  return {
    filterSection,
    applyFilter,
    packMatchesFilters,
    getActiveTab: () => filterState.activeTab,
  };
}
