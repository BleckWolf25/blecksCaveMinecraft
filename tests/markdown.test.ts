/**
 * @file markdown.test.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Unit test suite for the markdown compilation pipeline.
 *
 * @description
 * Tests the marked parser and DOMPurify sanitizer integration, ensuring headings, inline styling, custom external links, lightbox image bindings, code block wrappers with copy buttons, GitHub callout alerts, and themed tables compile accurately and safely.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import { compileMarkdown } from '../src/utils/markdown.ts';

// ---------- TEST SUITE: MARKDOWN COMPILER UTIL
describe('Markdown Compiler Util', () => {
  // ---------- SUITE: HEADINGS & INLINE FORMATTING
  it('should compile headings correctly', () => {
    expect(compileMarkdown('# Hello')).toContain('<h1>Hello</h1>');
    expect(compileMarkdown('## Section 2')).toContain('<h2>Section 2</h2>');
    expect(compileMarkdown('### Section 3')).toContain('<h3>Section 3</h3>');
  });

  it('should compile inline formatting (bold, italic, code)', () => {
    expect(compileMarkdown('**bold text**')).toContain('<strong>bold text</strong>');
    expect(compileMarkdown('_italic text_')).toContain('<em>italic text</em>');
    expect(compileMarkdown('`code snippet`')).toContain('<code>code snippet</code>');
  });

  // ---------- SUITE: LINKS, IMAGES & LISTS
  it('should compile links and images with lightbox attributes', () => {
    expect(compileMarkdown('[link text](https://google.com)')).toContain(
      '<a href="https://google.com" target="_blank" rel="noopener">link text</a>'
    );
    expect(compileMarkdown('![alt image](image.png)')).toContain(
      '<img src="image.png" alt="alt image" data-lightbox="true"'
    );
  });

  it('should compile lists', () => {
    const listMd = '- Item 1\n- Item 2';
    const compiled = compileMarkdown(listMd);
    expect(compiled).toContain('<ul>');
    expect(compiled).toContain('<li>Item 1</li>');
    expect(compiled).toContain('<li>Item 2</li>');
    expect(compiled).toContain('</ul>');
  });

  // ---------- SUITE: CODE BLOCKS & CALLOUT ALERTS
  it('should compile code blocks with copy clipboards', () => {
    const codeBlock = '```javascript\nconst a = 1;\n```';
    const compiled = compileMarkdown(codeBlock);
    expect(compiled).toContain('code-block-wrapper');
    expect(compiled).toContain('code-copy-btn');
    expect(compiled).toContain('<code class="language-javascript">const a = 1;</code>');
  });

  it('should compile GitHubAlert callouts utilizing modular Alert elements', () => {
    expect(compileMarkdown('> [!NOTE]\n> Test Note')).toContain('wiki-callout note-alert');
    expect(compileMarkdown('> [!IMPORTANT]\n> Critical task')).toContain(
      'wiki-callout important-alert'
    );
    expect(compileMarkdown('> [!WARNING]\n> High risk warnings')).toContain(
      'wiki-callout warning-alert'
    );
    expect(compileMarkdown('> sanguis et ferrum chronicles')).toContain(
      'wiki-callout medieval-alert'
    );
  });

  // ---------- SUITE: TABLES
  it('should compile markdown tables into clean layout blocks', () => {
    const tableMd = '| Head 1 | Head 2 |\n|---|---|\n| Cell 1 | Cell 2 |';
    const compiled = compileMarkdown(tableMd);
    expect(compiled).toContain('<table');
    expect(compiled).toContain('Head 1');
    expect(compiled).toContain('Cell 2');
  });
});
