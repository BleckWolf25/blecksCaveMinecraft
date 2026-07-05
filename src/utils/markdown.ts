/**
 * @file markdown.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Custom markdown parser, syntax highliter, and DOM sanitation pipeline.
 *
 * @description
 * Configures the 'marked' renderer with custom rules for code blocks with clipboard copy utilities, responsive image lightboxes, themed tables, and GitHub-style callout alerts, sanitizing the resulting HTML with DOMPurify to prevent XSS vulnerabilities.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Alert } from '../components/ui/Alert.ts';

// ---------- MARKED RENDERER CONFIGURATION
const renderer = new marked.Renderer();

// ---------- CUSTOM CODE BLOCKS (inject clipboard copy button and language markup)
renderer.code = function({ text, lang, escaped }) {
  const codeText = escaped ? text : escapeHtml(text);
  return `
    <div class="code-block-wrapper">
      <button class="code-copy-btn" aria-label="Copy code to clipboard">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <pre><code class="language-${lang || 'plaintext'}">${codeText}</code></pre>
    </div>
  `;
};

// ---------- CUSTOM LINKS & IMAGES (enforce external link target and lightbox bindings)
renderer.link = function({ href, title, text }) {
  const target = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${target}${titleAttr}>${text}</a>`;
};

renderer.image = function({ href, title, text }) {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" data-lightbox="true" class="wiki-inline-img" style="max-width:100%; border-radius:10px; margin: 1rem 0; box-shadow:0 5px 15px rgba(0,0,0,0.3); cursor: zoom-in;" />`;
};

// ---------- CUSTOM TABLES (build themed responsive table containers)
renderer.table = function(token) {
  let headerHtml = '';
  if (token.header.length > 0) {
    headerHtml += '<thead><tr>';
    token.header.forEach(cell => {
      headerHtml += `<th>${marked.parseInline(cell.text) as string}</th>`;
    });
    headerHtml += '</tr></thead>';
  }

  let bodyHtml = '<tbody>';
  token.rows.forEach((row, rIdx) => {
    bodyHtml += `<tr>`;
    row.forEach(cell => {
      bodyHtml += `<td>${marked.parseInline(cell.text) as string}</td>`;
    });
    bodyHtml += '</tr>';
  });
  bodyHtml += '</tbody>';

  return `<div class="wiki-table-container"><table>${headerHtml}${bodyHtml}</table></div>`;
};

// ---------- CUSTOM BLOCKQUOTES & ALERTS (parse GitHub alert prefixes and medieval callout styles)
renderer.blockquote = function({ tokens }) {
  let contentHtml = '';
  let rawText = '';
  
  tokens.forEach(token => {
    if (token.type === 'paragraph') {
      rawText += token.raw + ' ';
    }
    contentHtml += marked.parser([token]);
  });

  const contentLower = rawText.trim().toLowerCase();

  if (contentLower.startsWith('[!note]')) {
    const htmlContent = contentHtml.replace(/<p>\[!NOTE\]<br>\s*/i, '<p>').replace(/<p>\[!NOTE\]\s*/i, '<p>');
    return Alert({ type: 'note', htmlContent }).outerHTML;
  }
  if (contentLower.startsWith('[!important]')) {
    const htmlContent = contentHtml.replace(/<p>\[!IMPORTANT\]<br>\s*/i, '<p>').replace(/<p>\[!IMPORTANT\]\s*/i, '<p>');
    return Alert({ type: 'important', htmlContent }).outerHTML;
  }
  if (contentLower.startsWith('[!warning]')) {
    const htmlContent = contentHtml.replace(/<p>\[!WARNING\]<br>\s*/i, '<p>').replace(/<p>\[!WARNING\]\s*/i, '<p>');
    return Alert({ type: 'warning', htmlContent }).outerHTML;
  }

  if (contentLower.includes('sanguis et ferrum') || contentLower.includes('natura non contristatur')) {
    return Alert({ type: 'medieval', htmlContent: contentHtml }).outerHTML;
  }

  return `<div class="wiki-callout"><blockquote>${contentHtml}</blockquote></div>`;
};

marked.use({ renderer });

// ---------- MARKDOWN COMPILATION & SANITIZATION API
/**
 * Escapes HTML tag characters to prevent script injection.
 * @param {string} text - Raw string.
 * @returns {string} Safe escaped string.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Compiles raw markdown text into custom themed HTML.
 * Uses 'marked' for full markdown support and 'dompurify' for security.
 * @param {string} markdown - The raw markdown text.
 * @returns {string} The compiled HTML string.
 */
export function compileMarkdown(markdown: string): string {
  // ---------- GUARD CLAUSE (return empty string for empty input)
  if (!markdown) {
    return '';
  }

  // ---------- PARSING & DOM SANITIZATION (filter unsafe tags and attributes)
  const rawHtml = marked.parse(markdown, { async: false });
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img',
      'span', 'details', 'summary', 'button', 'svg', 'rect', 'path'],
    ALLOWED_ATTR: ['href', 'name', 'target', 'rel', 'src', 'alt', 'class', 'data-lightbox',
      'aria-label', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
      'x', 'y', 'rx', 'ry', 'd'],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onload']
  });

  return cleanHtml;
}
