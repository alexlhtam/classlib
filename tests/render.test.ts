import { describe, it, expect } from 'vitest';
import { renderMarkdown, extractToc } from '../lib/render';

describe('renderMarkdown — sanitization', () => {
  it('strips <script> tags', () => {
    const html = renderMarkdown('Hello\n\n<script>alert(1)</script>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('strips inline event handlers / onerror', () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('drops javascript: link protocols', () => {
    const html = renderMarkdown('[click](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });
});

describe('renderMarkdown — content', () => {
  it('renders Markdown structure', () => {
    const html = renderMarkdown('# Title\n\nSome **bold** text.');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('renders KaTeX for inline and display math', () => {
    const html = renderMarkdown('Inline $a^2$ and\n\n$$T(n) = \\Theta(n)$$');
    // KaTeX emits spans with the katex class for both modes.
    expect(html).toContain('katex');
    expect(html).toContain('katex-display');
  });
});

describe('extractToc', () => {
  it('collects H2+ headings with levels', () => {
    const toc = extractToc('# Title\n## A\n### B\n## C');
    expect(toc).toEqual([
      { level: 2, text: 'A' },
      { level: 3, text: 'B' },
      { level: 2, text: 'C' },
    ]);
  });
});
