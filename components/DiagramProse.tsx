'use client';

// DiagramProse — renders sanitized note HTML (from lib/render.ts) and upgrades
// any .cl-mermaid blocks into rendered diagrams on the client.
//
// Security: Mermaid runs with securityLevel:'strict' and htmlLabels:false (no
// click/JS directives, no foreignObject HTML), and its SVG output is run back
// through DOMPurify before insertion. The note HTML itself was already
// sanitized server-side.

import { useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

let mermaidReady = false;

// Editorial palette (mirrors globals.css :root tokens) so diagrams match the
// rest of the page instead of Mermaid's default blue.
const THEME_VARIABLES = {
  fontFamily: '"Source Serif 4", Georgia, serif',
  fontSize: '15px',
  primaryColor: '#F5F1E8',
  primaryBorderColor: '#7A2E2E',
  primaryTextColor: '#1F1A14',
  // node + edge label text must be explicitly inked or it renders invisible
  nodeTextColor: '#1F1A14',
  textColor: '#1F1A14',
  lineColor: '#5A5147',
  secondaryColor: '#EFEAE0',
  tertiaryColor: '#FBF8F2',
  noteBkgColor: '#F1E4E0',
  noteTextColor: '#1F1A14',
};

export function DiagramProse({ html, fontSize = 17 }: { html: string; fontSize?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('.cl-mermaid:not([data-cl-done])'),
    );
    if (blocks.length === 0) return;

    let cancelled = false;
    (async () => {
      const mermaid = (await import('mermaid')).default;
      if (!mermaidReady) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: THEME_VARIABLES,
          // htmlLabels:false renders labels as plain SVG <text> instead of
          // <foreignObject> HTML — the latter is stripped by the DOMPurify pass
          // below, which is why labels were vanishing. With nodeTextColor set in
          // THEME_VARIABLES the <text> labels paint correctly.
          htmlLabels: false,
          flowchart: { curve: 'basis', htmlLabels: false, padding: 14 },
        });
        mermaidReady = true;
      }
      for (let i = 0; i < blocks.length; i++) {
        const el = blocks[i];
        if (cancelled) return;
        const source = el.textContent ?? '';
        el.setAttribute('data-cl-done', '');
        try {
          const id = `cl-mmd-${Math.random().toString(36).slice(2)}-${i}`;
          const { svg } = await mermaid.render(id, source);
          if (cancelled) return;
          el.innerHTML = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true, html: true },
          });
          el.classList.add('cl-mermaid-rendered');
        } catch {
          el.classList.add('cl-mermaid-error');
          el.textContent = 'Diagram could not be rendered.';
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className="cl-prose"
      style={{ fontSize, lineHeight: 1.7, fontFamily: 'var(--cl-body-font)', color: 'var(--cl-ink)' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
