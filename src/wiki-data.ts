/**
 * @file wiki-data.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Central project catalog and global theming configurations.
 *
 * @description
 * Houses the static dataset representing all custom Minecraft projects, defining color palettes, typography links, specification lists, tag categorizations, and mapping document structures for the wiki.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { ThemeConfig, Modpack, AppLabels } from './types.ts';
import structureData from './content/structure.json';

// ---------- GLOBAL PORTAL THEME
export const globalPortalTheme: ThemeConfig = {
  id: 'portal',
  name: 'Bleck Wiki',
  title: "Bleck's Cave",
  subtitle:
    "Welcome to the central hub for Bleck's custom modpacks, mods, resource packs, and shaders. Select any of these below to explore its dedicated wiki.",
  brandName: 'bleckCaveWiki',
  fontFamily: 'Outfit, sans-serif',
  fontImport:
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;500;700&display=swap',
  colors: {
    primary: '180, 100%, 50%', // Turquoise
    primaryBg: '220, 20%, 8%', // Deep Obsidian
    primaryText: '210, 20%, 98%', // Near White
    secondaryText: '215, 15%, 70%', // Muted Blue Gray
    surface: '220, 20%, 12%', // Cards
    border: '220, 20%, 20%', // Borders
    glow: '180, 100%, 50%',
    shadow: '0, 0%, 0%',
  },
};

// ---------- APPLICATION UI LABELS
export const appLabels: AppLabels = {
  gridTitle: 'Explore other Universes',
  specsTitle: 'Modpack Specs',
  tocTitle: 'On this page',
  editWikiPrefix: 'Edit Wiki:',
};

// ---------- PROJECT CATALOG
export const modpacks: Record<string, Modpack> = {
  'velocita-optimized': {
    id: 'velocita-optimized',
    type: 'modpack',
    title: 'Velocita Optimized',
    summary: 'Lightweight, incredible fast, beautiful and QoL in a single package. Fabric & Neo',
    fontFamily: '"JetBrains Mono", monospace, sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&family=Inter:wght@300;400;600;700&display=swap',
    colors: {
      primary: '210, 100%, 55%', // Neon Electric Blue
      primaryBg: '210, 15%, 8%', // Slate Black
      primaryText: '210, 20%, 98%', // Electric Offwhite
      secondaryText: '210, 10%, 75%', // Muted Slate
      surface: '210, 15%, 12%', // Cards
      border: '210, 100%, 55%', // Bright Blue Borders
      glow: '210, 100%, 55%',
      shadow: '210, 100%, 15%',
    },
    specs: {
      version: 'v2.0.0',
      loaders: ['Fabric', 'NeoForge', 'Quilt', 'Forge'],
      mcVersions: [
        '1.16.5',
        '1.17.1',
        '1.18',
        '1.18.1',
        '1.18.2',
        '1.19',
        '1.19.1',
        '1.19.2',
        '1.19.3',
        '1.19.4',
        '1.20.1',
        '1.20.2',
        '1.20.3',
        '1.20.4',
        '1.20.5',
        '1.20.6',
        '1.21',
        '1.21.1',
        '1.21.2',
        '1.21.3',
        '1.21.4',
      ],
      performance: 'Up to 300% FPS Increase',
      focus: 'Lightweight & QoL',
    },
    tags: ['Modpack', 'Optimization', 'Client-Side'],
    pages: structureData['velocita-optimized'],
  },
  'builder-plus-plus': {
    id: 'builder-plus-plus',
    type: 'modpack',
    title: 'Builder++',
    summary: 'Speedy, Efficient & beautiful features in a single package.',
    fontFamily: '"Space Grotesk", "Outfit", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Outfit:wght@300;400;600;700&display=swap',
    colors: {
      primary: '142, 70%, 45%', // Warm Emerald Green
      primaryBg: '35, 10%, 8%', // Earthy Warm Charcoal
      primaryText: '35, 10%, 96%', // Warm Sand White
      secondaryText: '35, 8%, 75%', // Warm Muted Gray
      surface: '35, 10%, 12%', // Blueprint Gray-Charcoal
      border: '142, 70%, 45%', // Emerald Accents
      glow: '142, 70%, 45%',
      shadow: '142, 30%, 10%',
    },
    specs: {
      version: 'v1.0.4',
      loaders: ['Fabric'],
      mcVersions: ['1.20.1'],
      performance: 'Optimized for Heavy Rendering',
      focus: 'Construction & Design',
    },
    tags: ['Modpack', 'Building', 'Optimization'],
    pages: structureData['builder-plus-plus'],
  },
  'better-than-pvp': {
    id: 'better-than-pvp',
    type: 'modpack',
    title: 'BetterThanPVP',
    summary:
      'Enhance your PvP skills with this lightweight client-side modpack! Packed with mods that boost performance and improve PVP in all ways possible.',
    fontFamily: '"Teko", "Rubik", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Teko:wght@500;700&family=Rubik:wght@300;400;500;700&display=swap',
    colors: {
      primary: '355, 85%, 50%', // Fiery Crimson Red
      primaryBg: '0, 0%, 6%', // Pitch Black
      primaryText: '0, 0%, 98%', // Stark White
      secondaryText: '0, 0%, 70%', // Muted Ash Gray
      surface: '0, 0%, 12%', // Charcoal Panels
      border: '355, 85%, 50%', // Fiery Red Borders
      glow: '355, 85%, 50%',
      shadow: '355, 50%, 10%',
    },
    specs: {
      version: 'v2.1.0',
      loaders: ['Fabric'],
      mcVersions: ['1.19.2', '1.20.1'],
      performance: 'Zero Input Lag & High Refresh Rate',
      focus: 'PvP & Competitive Play',
    },
    tags: ['Modpack', 'PvP', 'Client-Side', 'Optimization'],
    pages: structureData['better-than-pvp'],
  },
  'aetas-ferrea': {
    id: 'aetas-ferrea',
    type: 'modpack',
    title: 'Aetas Ferrea',
    summary:
      'An unyielding age of iron. Experience a brutal, photorealistic survival simulation featuring thirst, localized injuries in a hardcore medieval world.',
    featured: true,
    fontFamily: '"Cinzel", "Lora", serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,500;1,400&display=swap',
    colors: {
      primary: '15, 60%, 40%', // Blood Red / Rust Orange
      primaryBg: '210, 5%, 8%', // Gritty Cold Iron Black
      primaryText: '30, 20%, 90%', // Weathered Parchment White
      secondaryText: '30, 10%, 70%', // Grimy Muted Stone
      surface: '210, 5%, 12%', // Cold Dark Slate
      border: '15, 50%, 35%', // Dark Rust Red Borders
      glow: '15, 60%, 35%',
      shadow: '0, 0%, 0%',
    },
    specs: {
      version: 'v1.0.0',
      loaders: ['Forge'],
      mcVersions: ['1.20.1'],
      performance: 'Quality Visuals with Moderate Optimization',
      focus: 'Medieval Hardcore Survival',
    },
    tags: ['Modpack', 'Hardcore', 'Multiplayer', 'Quests', 'Survival', 'Challenge'],
    pages: structureData['aetas-ferrea'],
  },
  'mc-vanilla-tweaked': {
    id: 'mc-vanilla-tweaked',
    type: 'modpack',
    title: 'MC Vanilla Tweaked',
    summary:
      'Want to enhance minecraft vanilla without changing too much and have a performance boost? Search no further! (Archived legacy project)',
    fontFamily: '"Press Start 2P", "Rubik", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rubik:wght@300;400;500;700&display=swap',
    colors: {
      primary: '120, 45%, 35%', // Nostalgic Minecraft Grass Green
      primaryBg: '25, 45%, 15%', // Dirt Brown / Dark Earth
      primaryText: '0, 0%, 95%', // Classic Off-White
      secondaryText: '30, 20%, 75%', // Sandy Gold-Gray
      surface: '25, 30%, 10%', // Compact Cobblestone Charcoal
      border: '120, 45%, 35%', // Pixellated Grass Green
      glow: '120, 45%, 35%',
      shadow: '0, 0%, 0%',
    },
    specs: {
      version: 'v1.0.0 [Archived]',
      loaders: ['Fabric'],
      mcVersions: ['1.21.4'],
      performance: 'Classic Performance Enhancer',
      focus: 'Vanilla Plus Nostalgia & Legacy',
    },
    tags: ['Modpack', 'Archive', 'Optimization'],
    isArchived: true,
    pages: structureData['mc-vanilla-tweaked'],
  },
  'bleck-qol-tweaks': {
    id: 'bleck-qol-tweaks',
    type: 'mod',
    title: 'Bleck QoL Tweaks',
    summary:
      'Essential client utility mod adding smooth camera animations, instant inventory sorting, and customizable HUD elements.',
    badge: 'New',
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;700&display=swap',
    colors: {
      primary: '160, 84%, 39%', // Emerald Jade Green
      primaryBg: '160, 20%, 7%', // Deep Forest Obsidian
      primaryText: '160, 20%, 98%', // Mint Offwhite
      secondaryText: '160, 15%, 75%', // Muted Mint
      surface: '160, 20%, 12%', // Cards
      border: '160, 84%, 39%', // Emerald Border
      glow: '160, 84%, 39%',
      shadow: '160, 80%, 10%',
    },
    specs: {
      version: 'v1.2.0',
      loaders: ['Fabric', 'NeoForge'],
      mcVersions: ['1.20.1', '1.20.4', '1.21.1'],
      performance: 'Zero Overhead (Client-Side)',
      focus: 'Quality of Life & HUD',
      clientSideOnly: true,
      dependencies: ['Fabric API', 'Cloth Config'],
    },
    tags: ['Mod', 'QoL', 'Client-Side', 'HUD'],
    pages: structureData['velocita-optimized'],
  },
  'bleck-pbr-overhaul': {
    id: 'bleck-pbr-overhaul',
    type: 'resource-pack',
    title: 'Bleck PBR Overhaul',
    summary:
      'A breathtaking 128x realistic texture suite featuring full LabPBR normal maps, specular reflections, and parallax occlusion mapping.',
    badge: 'Hot',
    fontFamily: '"Cinzel", "Outfit", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@400;500;700&display=swap',
    colors: {
      primary: '45, 93%, 47%', // Warm Amber Gold
      primaryBg: '35, 20%, 8%', // Earthy Bronze Black
      primaryText: '45, 20%, 98%', // Warm Sand White
      secondaryText: '45, 15%, 75%', // Muted Bronze
      surface: '35, 20%, 12%', // Cards
      border: '45, 93%, 47%', // Golden Border
      glow: '45, 93%, 47%',
      shadow: '45, 80%, 10%',
    },
    specs: {
      version: 'v3.0.0',
      mcVersions: ['1.20.1', '1.21', '1.21.1', '1.21.4'],
      resolution: '128x',
      performance: 'Requires PBR Shader Support',
      focus: 'Realistic Normal Maps & Parallax',
    },
    tags: ['Resource Pack', '128x', 'PBR', 'Realistic'],
    pages: structureData['velocita-optimized'],
  },
  'bleck-combat-style': {
    id: 'bleck-combat-style',
    type: 'mod',
    title: 'Bleck Combat Style',
    summary:
      'An overhauled third-person melee combat system featuring fluid attack animations, precision weapon parrying, and dynamic poise mechanics.',
    badge: 'Popular',
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;700&display=swap',
    colors: {
      primary: '0, 80%, 55%', // Crimson Red
      primaryBg: '0, 15%, 8%', // Dark Blood Black
      primaryText: '0, 10%, 98%', // Off-white
      secondaryText: '0, 10%, 75%', // Muted Pink-Gray
      surface: '0, 15%, 12%', // Cards
      border: '0, 80%, 55%', // Crimson Border
      glow: '0, 80%, 55%',
      shadow: '0, 80%, 10%',
    },
    specs: {
      version: 'v2.1.0',
      loaders: ['Fabric', 'Forge', 'NeoForge'],
      mcVersions: ['1.20.1', '1.21.1'],
      performance: 'Lightweight Animation Controller',
      focus: 'Melee Combat Overhaul',
    },
    tags: ['Mod', 'Combat', 'Animations', 'PvE'],
    pages: structureData['velocita-optimized'],
  },
  'bleck-metallurgy': {
    id: 'bleck-metallurgy',
    type: 'mod',
    title: 'Bleck Metallurgy',
    summary:
      'Introduces 12 fantasy alloying ores, modular alloy smelting crucibles, and customized tool smithing with unique material traits.',
    fontFamily: '"Cinzel", "Outfit", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@400;500;700&display=swap',
    colors: {
      primary: '200, 80%, 50%', // Steel Blue / Cyan
      primaryBg: '200, 15%, 8%', // Dark Steel Black
      primaryText: '200, 10%, 98%', // Off-white
      secondaryText: '200, 10%, 75%', // Muted Blue-Gray
      surface: '200, 15%, 12%', // Cards
      border: '200, 80%, 50%', // Cyan Border
      glow: '200, 80%, 50%',
      shadow: '200, 80%, 10%',
    },
    specs: {
      version: 'v1.0.4',
      loaders: ['Forge', 'NeoForge'],
      mcVersions: ['1.20.1', '1.21.1'],
      performance: 'Optimized World Generation',
      focus: 'Ores, Alloys & Smithing',
    },
    tags: ['Mod', 'Ores', 'Smelting', 'Equipment'],
    pages: structureData['velocita-optimized'],
  },
  'bleck-medical-realism': {
    id: 'bleck-medical-realism',
    type: 'resource-pack',
    title: 'Bleck Medical Realism',
    summary:
      'A 32x immersive UI and audio overhaul for survival health systems, custom bandage textures, and detailed status effect icons.',
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontImport:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;700&display=swap',
    colors: {
      primary: '340, 80%, 60%', // Medical Pink / Rose
      primaryBg: '340, 15%, 8%', // Dark Rose Black
      primaryText: '340, 10%, 98%', // Crisp White
      secondaryText: '340, 10%, 75%', // Muted Rose
      surface: '340, 15%, 12%', // Cards
      border: '340, 80%, 60%', // Rose Border
      glow: '340, 80%, 60%',
      shadow: '340, 80%, 10%',
    },
    specs: {
      version: 'v1.1.0',
      mcVersions: ['1.20.1', '1.21', '1.21.4'],
      resolution: '32x',
      performance: 'Vanilla Compatible',
      focus: 'UI, Health & Audio Overhaul',
    },
    tags: ['Resource Pack', '32x', 'GUI', 'Audio'],
    pages: structureData['velocita-optimized'],
  },
};

// ---------- ALIAS EXPORTS
export const projects = modpacks;
