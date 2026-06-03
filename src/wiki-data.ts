import { ThemeConfig, Modpack, AppLabels } from './types.ts';
import structureData from './content/structure.json';

export const globalPortalTheme: ThemeConfig = {
  id: 'portal',
  name: 'Bleck Wiki',
  title: "Bleck's Cave",
  subtitle: "Welcome to the central hub for Bleck's custom modpacks, mods, resource packs, and shaders. Select any of these below to explore its dedicated wiki.",
  brandName: 'bleckCaveWiki',
  fontFamily: 'Outfit, sans-serif',
  fontImport: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;500;700&display=swap',
  colors: {
    primary: '180, 100%, 50%',     // Turquoise
    primaryBg: '220, 20%, 8%',      // Deep Obsidian
    primaryText: '210, 20%, 98%',   // Near White
    secondaryText: '215, 15%, 70%', // Muted Blue Gray
    surface: '220, 20%, 12%',       // Cards
    border: '220, 20%, 20%',        // Borders
    glow: '180, 100%, 50%',
    shadow: '0, 0%, 0%'
  }
};

export const appLabels: AppLabels = {
  gridTitle: 'Explore other Universes',
  specsTitle: 'Modpack Specs',
  tocTitle: 'On this page',
  editWikiPrefix: 'Edit Wiki:'
};

export const modpacks: Record<string, Modpack> = {
  'velocita-optimized': {
    id: 'velocita-optimized',
    title: 'Velocita Optimized',
    summary: 'Lightweight, incredible fast, beautiful and QoL in a single package. Fabric & Neo',
    fontFamily: '"JetBrains Mono", monospace, sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&family=Inter:wght@300;400;600;700&display=swap',
    colors: {
      primary: '210, 100%, 55%',     // Neon Electric Blue
      primaryBg: '210, 15%, 8%',      // Slate Black
      primaryText: '210, 20%, 98%',   // Electric Offwhite
      secondaryText: '210, 10%, 75%', // Muted Slate
      surface: '210, 15%, 12%',       // Cards
      border: '210, 100%, 55%',       // Bright Blue Borders
      glow: '210, 100%, 55%',
      shadow: '210, 100%, 15%'
    },
    specs: {
      version: 'v2.0.0',
      loaders: ['Fabric', 'NeoForge', 'Quilt', 'Forge'],
      mcVersions: ['1.16.5', '1.17.1', '1.18', '1.18.1', '1.18.2', '1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4', '1.20.1', '1.20.2', '1.20.3', '1.20.4', '1.20.5', '1.20.6', '1.21', '1.21.1', '1.21.2', '1.21.3', '1.21.4' ],
      performance: 'Up to 300% FPS Increase',
      focus: 'Lightweight & QoL'
    },
    tags: ['Modpack', 'Optimization', 'Client-Side'],
    pages: structureData['velocita-optimized']
  },
  'builder-plus-plus': {
    id: 'builder-plus-plus',
    title: 'Builder++',
    summary: 'Speedy, Efficient & beautiful features in a single package.',
    fontFamily: '"Space Grotesk", "Outfit", sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Outfit:wght@300;400;600;700&display=swap',
    colors: {
      primary: '142, 70%, 45%',     // Warm Emerald Green
      primaryBg: '35, 10%, 8%',       // Earthy Warm Charcoal
      primaryText: '35, 10%, 96%',    // Warm Sand White
      secondaryText: '35, 8%, 75%',   // Warm Muted Gray
      surface: '35, 10%, 12%',        // Blueprint Gray-Charcoal
      border: '142, 70%, 45%',        // Emerald Accents
      glow: '142, 70%, 45%',
      shadow: '142, 30%, 10%'
    },
    specs: {
      version: 'v1.0.4',
      loaders: ['Fabric'],
      mcVersions: ['1.20.1'],
      performance: 'Optimized for Heavy Rendering',
      focus: 'Construction & Design'
    },
    tags: ['Modpack', 'Building', 'Optimization'],
    pages: structureData['builder-plus-plus']
  },
  'better-than-pvp': {
    id: 'better-than-pvp',
    title: 'BetterThanPVP',
    summary: 'Enhance your PvP skills with this lightweight client-side modpack! Packed with mods that boost performance and improve PVP in all ways possible.',
    fontFamily: '"Teko", "Rubik", sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Teko:wght@500;700&family=Rubik:wght@300;400;500;700&display=swap',
    colors: {
      primary: '355, 85%, 50%',     // Fiery Crimson Red
      primaryBg: '0, 0%, 6%',         // Pitch Black
      primaryText: '0, 0%, 98%',      // Stark White
      secondaryText: '0, 0%, 70%',    // Muted Ash Gray
      surface: '0, 0%, 12%',          // Charcoal Panels
      border: '355, 85%, 50%',       // Fiery Red Borders
      glow: '355, 85%, 50%',
      shadow: '355, 50%, 10%'
    },
    specs: {
      version: 'v2.1.0',
      loaders: ['Fabric'],
      mcVersions: ['1.19.2', '1.20.1'],
      performance: 'Zero Input Lag & High Refresh Rate',
      focus: 'PvP & Competitive Play'
    },
    tags: ['Modpack', 'PvP', 'Client-Side', 'Optimization '],
    pages: structureData['better-than-pvp']
  },
  'aetas-ferrea': {
    id: 'aetas-ferrea',
    title: 'Aetas Ferrea',
    summary: 'An unyielding age of iron. Experience a brutal, photorealistic survival simulation featuring thirst, localized injuries in a hardcore medieval world.',
    fontFamily: '"Cinzel", "Lora", serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,500;1,400&display=swap',
    colors: {
      primary: '15, 60%, 40%',      // Blood Red / Rust Orange
      primaryBg: '210, 5%, 8%',       // Gritty Cold Iron Black
      primaryText: '30, 20%, 90%',    // Weathered Parchment White
      secondaryText: '30, 10%, 70%',  // Grimy Muted Stone
      surface: '210, 5%, 12%',        // Cold Dark Slate
      border: '15, 50%, 35%',         // Dark Rust Red Borders
      glow: '15, 60%, 35%',
      shadow: '0, 0%, 0%'
    },
    specs: {
      version: 'v1.0.0',
      loaders: ['Forge'],
      mcVersions: ['1.20.1'],
      performance: 'Quality Visuals with Moderate Optimization',
      focus: 'Medieval Hardcore Survival'
    },
    tags: ['Modpack', 'Hardcore', 'Multiplayer', 'Quests', 'Survival', 'Challenge'],
    pages: structureData['aetas-ferrea']
  },
  'mc-vanilla-tweaked': {
    id: 'mc-vanilla-tweaked',
    title: 'MC Vanilla Tweaked',
    summary: 'Want to enhance minecraft vanilla without changing too much and have a performance boost? Search no further! (Archived legacy project)',
    fontFamily: '"Press Start 2P", "Rubik", sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rubik:wght@300;400;500;700&display=swap',
    colors: {
      primary: '120, 45%, 35%',     // Nostalgic Minecraft Grass Green
      primaryBg: '25, 45%, 15%',       // Dirt Brown / Dark Earth
      primaryText: '0, 0%, 95%',       // Classic Off-White
      secondaryText: '30, 20%, 75%',   // Sandy Gold-Gray
      surface: '25, 30%, 10%',        // Compact Cobblestone Charcoal
      border: '120, 45%, 35%',        // Pixellated Grass Green
      glow: '120, 45%, 35%',
      shadow: '0, 0%, 0%'
    },
    specs: {
      version: 'v1.0.0 [Archived]',
      loaders: ['Fabric'],
      mcVersions: ['1.21.4'],
      performance: 'Classic Performance Enhancer',
      focus: 'Vanilla Plus Nostalgia & Legacy'
    },
    tags: ['Modpack', 'Archive', 'Optimization'],
    isArchived: true,
    pages: structureData['mc-vanilla-tweaked']
  }
};
