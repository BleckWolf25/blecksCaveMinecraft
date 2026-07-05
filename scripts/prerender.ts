/**
 * @file prerender.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Zero-dependency static pre-renderer for SEO HTML shells.
 *
 * @description
 * Executes after Vite production builds to generate fully rendered static HTML index files for every wiki document and project route, reading markdown content from disk and compiling static HTML shells to ensure optimal Search Engine Optimization and fast initial content display.
 *
 * @since 25/06/2026
 * @updated 05/07/2026
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
// ---------- IMPORTS
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

// ---------- DIRECTORY CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content');

// ---------- TYPE DEFINITIONS & DATA LOADING
interface WikiPageDef {
  title: string;
  contentMarkdown?: string;
  isHeader?: boolean;
}
type StructureMap = Record<string, Record<string, WikiPageDef>>;

const structure: StructureMap = JSON.parse(
  fs.readFileSync(path.join(CONTENT, 'structure.json'), 'utf-8')
);

// Read modpack display titles from wiki-data (we extract just the title, no TS imports)
const PACK_TITLES: Record<string, string> = {
  'velocita-optimized': 'Velocita Optimized',
  'builder-plus-plus': 'Builder++',
  'better-than-pvp': 'BetterThanPVP',
  'aetas-ferrea': 'Aetas Ferrea',
  'mc-vanilla-tweaked': 'MC Vanilla Tweaked',
};

// Read the SPA shell HTML (built by vite build)
const shellHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

// ---------- PRE-RENDERING & SITEMAP GENERATION
let pagesRendered = 0;
const sitemapUrls: string[] = [
  `  <url>\n    <loc>https://bleckscaveminecraft.wiki/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
];

for (const [modpackId, pages] of Object.entries(structure)) {
  const packTitle = PACK_TITLES[modpackId] ?? modpackId;

  for (const [pageId, pageDef] of Object.entries(pages)) {
    if (pageDef.isHeader) {
      continue;
    } // skip category headers

    const pageTitle = pageDef.title;

    // Load markdown, prefer file on disk, fallback to inline contentMarkdown
    let rawMarkdown = pageDef.contentMarkdown ?? '';
    const mdFilePath = path.join(CONTENT, modpackId, `${pageId}.md`);
    if (fs.existsSync(mdFilePath)) {
      rawMarkdown = fs.readFileSync(mdFilePath, 'utf-8');
    }

    // Compile to HTML for description meta tag
    const bodyHtml = marked.parse(rawMarkdown, { async: false });
    const excerpt = rawMarkdown
      .replace(/^#+\s+.+$/gm, '') // strip headings
      .replace(/[*_`>[\]!#]/g, '') // strip markdown symbols
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 155);

    // Inject per-page meta into the shell
    const title = `${pageTitle}, ${packTitle} | Bleck's Cave Wiki`;
    const html = shellHtml
      .replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`)
      .replace(
        '</head>',
        [
          `<meta name="description" content="${escHtml(excerpt)}">`,
          `<meta property="og:title" content="${escHtml(title)}">`,
          `<meta property="og:description" content="${escHtml(excerpt)}">`,
          `<meta property="og:type" content="article">`,
          `<link rel="canonical" href="/${modpackId}/${pageId}">`,
          // Inject a noscript fallback with the article content
          `<noscript><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;}</style></noscript>`,
          `<noscript><div style="padding:2rem"><h1>${escHtml(pageTitle)}</h1>${bodyHtml}</div></noscript>`,
          '</head>',
        ].join('\n')
      );

    // Write to dist/{modpackId}/{pageId}/index.html
    const outDir = path.join(DIST, modpackId, pageId);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    pagesRendered++;

    // Track for sitemap
    const priority = pageId === 'overview' ? '0.9' : '0.7';
    sitemapUrls.push(
      `  <url>\n    <loc>https://bleckscaveminecraft.wiki/${modpackId}/${pageId}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    );
  }
}

// Write generated sitemap.xml to dist
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf-8');

console.log(`✓ Pre-rendered ${pagesRendered} wiki pages and generated sitemap.xml for SEO.`);

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
