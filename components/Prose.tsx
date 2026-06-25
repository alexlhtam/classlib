// Prose.tsx — renders pre-sanitized HTML (from lib/render.ts) inside the
// editorial .cl-prose container. The HTML is already sanitized server-side, so
// dangerouslySetInnerHTML is safe here. No interactivity → server component.

export function Prose({ html, fontSize = 17 }: { html: string; fontSize?: number }) {
  return (
    <div
      className="cl-prose"
      style={{
        fontSize,
        lineHeight: 1.7,
        fontFamily: 'var(--cl-body-font)',
        color: 'var(--cl-ink)',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
