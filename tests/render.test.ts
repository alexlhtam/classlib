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

describe('renderMarkdown — diagrams', () => {
  it('turns a ```mermaid fence into a .cl-mermaid block (not a code block)', () => {
    const html = renderMarkdown('text\n\n```mermaid\nflowchart LR\n  A --> B\n```');
    expect(html).toContain('class="cl-mermaid"');
    expect(html).not.toContain('<code');
    // source survives as escaped text content
    expect(html).toContain('flowchart LR');
  });

  it('compiles a ```graph dict into mermaid inside a .cl-mermaid block', () => {
    const spec = JSON.stringify({ vertices: ['s', 't'], edges: [['s', 't', 3]], weighted: true });
    const html = renderMarkdown('```graph\n' + spec + '\n```');
    expect(html).toContain('class="cl-mermaid"');
    expect(html).toContain('flowchart');
    expect(html).toContain('ns'); // compiled node id
  });

  it('emits an error block for an invalid ```graph spec instead of throwing', () => {
    const html = renderMarkdown('```graph\n{ not json\n```');
    expect(html).toContain('cl-mermaid-error');
  });

  it('escapes diagram source so it cannot inject live markup', () => {
    const html = renderMarkdown('```mermaid\n<img src=x onerror=alert(1)>\n```');
    // The source rides inside the <pre> as escaped text, not as a real tag.
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img src');
    // (Render-time XSS is additionally blocked by Mermaid strict mode + client
    // SVG sanitization, which need a browser — exercised in the Playwright check.)
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
