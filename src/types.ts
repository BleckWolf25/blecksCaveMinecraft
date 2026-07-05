/**
 * @file types.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Global type definitions and data structures.
 *
 * @description
 * Defines shared interfaces and type aliases for application theming, project metadata, specification tables, wiki document formatting, and lifecycle cleanup callbacks.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- THEME TYPE DEFINITIONS
export interface ThemeColors {
  primary: string;
  primaryBg: string;
  primaryText: string;
  secondaryText: string;
  surface: string;
  border: string;
  glow: string;
  shadow: string;
}

export interface ThemeConfig {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  brandName?: string;
  fontFamily: string;
  fontImport: string;
  colors: ThemeColors;
}

// ---------- UI LABEL TYPE DEFINITIONS
export interface AppLabels {
  gridTitle: string;
  specsTitle: string;
  tocTitle: string;
  editWikiPrefix: string;
}

// ---------- PROJECT METADATA TYPE DEFINITIONS
export type ProjectType = 'modpack' | 'mod' | 'resource-pack' | 'shader';

export interface ModpackSpecs {
  version: string;
  loaders?: string[];
  mcVersions: string[];
  performance?: string;
  focus?: string;
  resolution?: string;
  performanceTier?: string;
  dependencies?: string[];
  clientSideOnly?: boolean;
}

export type ProjectSpecs = ModpackSpecs;

// ---------- WIKI CONTENT TYPE DEFINITIONS
export interface WikiPage {
  title: string;
  contentMarkdown: string;
  isHeader?: boolean;
}

export interface Modpack {
  id: string;
  type?: ProjectType;
  title: string;
  summary: string;
  featured?: boolean;
  badge?: string;
  fontFamily: string;
  fontImport: string;
  colors: ThemeColors;
  specs: ModpackSpecs;
  tags: string[];
  pages: Record<string, WikiPage>;
  isArchived?: boolean;
}

export type Project = Modpack;

// ---------- UTILITY TYPE DEFINITIONS
export type CleanupCallback = () => void;
