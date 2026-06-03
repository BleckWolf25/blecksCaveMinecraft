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

export interface AppLabels {
  gridTitle: string;
  specsTitle: string;
  tocTitle: string;
  editWikiPrefix: string;
}

export interface ModpackSpecs {
  version: string;
  loaders: string[];
  mcVersions: string[];
  performance: string;
  focus: string;
}

export interface WikiPage {
  title: string;
  contentMarkdown: string;
  isHeader?: boolean;
}

export interface Modpack {
  id: string;
  title: string;
  summary: string;
  fontFamily: string;
  fontImport: string;
  colors: ThemeColors;
  specs: ModpackSpecs;
  tags: string[];
  pages: Record<string, WikiPage>;
  isArchived?: boolean;
}

export type CleanupCallback = () => void;
