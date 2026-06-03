import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Alert } from '../components/ui/Alert.ts';

// Customize marked renderer to match our previous custom UI features
const renderer = new marked.Renderer();

// Custom code blocks with copy buttons
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

// Custom images with lightbox
renderer.image = function({ href, title, text }) {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" data-lightbox="true" class="wiki-inline-img" style="max-width:100%; border-radius:10px; margin: 1rem 0; box-shadow:0 5px 15px rgba(0,0,0,0.3); cursor: zoom-in;" />`;
};

// Custom tables with styling
renderer.table = function(token) {
  // We need to render the table rows and headers
  let headerHtml = '';
  if (token.header.length > 0) {
    headerHtml += '<thead style="border-bottom:2px solid hsla(var(--primary), 0.3); background:hsla(var(--surface), 0.8);"><tr>';
    token.header.forEach(cell => {
      headerHtml += `<th style="padding:1rem; font-weight:700; color:#fff; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.5px;">${marked.parseInline(cell.text)}</th>`;
    });
    headerHtml += '</tr></thead>';
  }

  let bodyHtml = '<tbody>';
  token.rows.forEach((row, rIdx) => {
    const isOdd = rIdx % 2 !== 0;
    const rowBg = isOdd ? 'hsla(var(--surface), 0.4)' : 'transparent';
    bodyHtml += `<tr style="border-bottom:1px solid hsla(var(--border), 0.1); background:${rowBg}; transition: background 0.2s ease;">`;
    row.forEach(cell => {
      bodyHtml += `<td style="padding:1rem; font-size:0.95rem; color:hsl(var(--secondary-text));">${marked.parseInline(cell.text)}</td>`;
    });
    bodyHtml += '</tr>';
  });
  bodyHtml += '</tbody>';

  return `<div style="overflow-x:auto; margin:2rem 0; box-shadow:0 4px 12px rgba(0,0,0,0.25); border-radius:12px;"><table style="width:100%; border-collapse:collapse; text-align:left; background:hsla(var(--surface), 0.6);">${headerHtml}${bodyHtml}</table></div>`;
};

// Custom blockquotes (GitHub alerts & Medieval fallbacks)
renderer.blockquote = function({ tokens }) {
  // Get raw text to check for alert prefixes
  // We have to extract the text from the tokens since blockquote gives us block tokens
  let contentHtml = '';
  let rawText = '';
  
  tokens.forEach(token => {
    if (token.type === 'paragraph') {
      rawText += token.raw + ' ';
    }
    // We re-parse without blockquotes to avoid infinite loops
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

  // Standard medieval fallback alert tags
  if (contentLower.includes('sanguis et ferrum') || contentLower.includes('natura non contristatur')) {
    return Alert({ type: 'medieval', htmlContent: contentHtml }).outerHTML;
  }

  return `<div class="wiki-callout"><blockquote>${contentHtml}</blockquote></div>`;
};

marked.use({ renderer });

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
  if (!markdown) {
    return '';
  }

  const rawHtml = marked.parse(markdown, { async: false }) as string;
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    // allow our custom inline styles added by the marked renderer
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img',
      'span', 'details', 'summary', 'button', 'svg', 'rect', 'path'],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class', 'style', 'data-lightbox',
      'aria-label', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
      'x', 'y', 'rx', 'ry', 'd'],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onload']
  });

  return cleanHtml;
}
