// Landing page placeholder. The full institution picker / sign-in lands in
// Phase 5; for now this confirms the editorial shell renders.
export default function LandingPage() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '80px 24px',
      }}
    >
      <p
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 12,
          color: 'var(--cl-ink-faint)',
          marginBottom: 8,
        }}
      >
        Knowledge Canvas
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 600, margin: '0 0 16px' }}>
        classlib
      </h1>
      <p style={{ fontSize: 18, color: 'var(--cl-ink-soft)', lineHeight: 1.6 }}>
        A collaborative class-notes library with GitHub-style pull-request review
        for edits. Read the canonical version of a note, suggest changes, and let
        maintainers review the diff before it merges.
      </p>
    </main>
  );
}
