// views-reader.jsx — read a note (Markdown + LaTeX), header bar with status,
// "Suggest edit" entry point, table of contents, prev/next.

function ReaderView({ data, noteId, theme, density, role, onBack, onSuggestEdit, onViewPRs }) {
  const d = cl_densityScale(density);
  const note = data.NOTES.find(n => n.id === noteId);
  const html = React.useMemo(() => cl_render(note.body), [note.body]);
  const openPRs = data.PRS.filter(p => p.noteId === noteId && p.status === 'open');

  // TOC from headings in body
  const toc = React.useMemo(() => {
    const out = [];
    const re = /^(##+)\s+(.+)$/gm;
    let m; while ((m = re.exec(note.body))) out.push({ level: m[1].length, text: m[2] });
    return out;
  }, [note.body]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 32,
      padding: `${d.pad + 12}px ${d.pad + 8}px`, color: 'var(--cl-ink)' }}>
      <div className="cl-fade" style={{ minWidth: 0 }}>
        <Btn variant="ghost" size="sm" onClick={onBack} icon={I.back(12)} style={{ marginBottom: 14, marginLeft: -8 }}>
          {note.module}
        </Btn>

        {/* Note header */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={note.status} theme={theme.badge} />
          <span style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)' }}>
            v{note.version} · last edited by <strong style={{ color: 'var(--cl-ink-soft)', fontWeight: 500 }}>{note.author}</strong> {note.updated}
          </span>
        </div>

        {openPRs.length > 0 && (
          <div onClick={onViewPRs} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'var(--cl-accent-tint)', color: 'var(--cl-accent)',
            borderRadius: 'var(--cl-radius)', fontSize: 13, marginBottom: 16, cursor: 'pointer',
            border: '1px solid color-mix(in oklab, var(--cl-accent) 25%, transparent)',
          }}>
            <span style={{ display: 'flex' }}>{I.pr(14)}</span>
            <span style={{ flex: 1 }}>
              <strong style={{ fontWeight: 600 }}>{openPRs.length} open {openPRs.length === 1 ? 'PR' : 'PRs'}</strong> on this note
              {role === 'maintainer' && ' — review pending'}
            </span>
            <span>{I.arrow(12)}</span>
          </div>
        )}

        {/* Title + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <h1 style={{
            margin: 0, fontSize: theme.name === 'editorial' ? 40 : 32,
            fontWeight: theme.name === 'editorial' ? 500 : 600,
            letterSpacing: theme.name === 'editorial' ? -0.6 : -0.4,
            lineHeight: 1.1, fontFamily: 'var(--cl-body-font)', flex: 1, minWidth: 0,
          }}>{note.title}</h1>
          <Btn variant="primary" size="sm" onClick={onSuggestEdit} icon={I.pencil(12)}>
            Suggest edit
          </Btn>
        </div>

        {/* Prose */}
        <div className="cl-prose" style={{
          fontSize: d.prose, lineHeight: 1.7,
          fontFamily: theme.serif ? 'var(--cl-body-font)' : '"Inter", system-ui, sans-serif',
          color: 'var(--cl-ink)',
        }} dangerouslySetInnerHTML={{ __html: html }} />

        {/* Footer meta */}
        <div style={{
          marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--cl-line-soft)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'var(--cl-ink-faint)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={note.author} size={20} />
            <span>Maintained by {note.author}</span>
          </div>
          <span>Last build {note.updated} · v{note.version}</span>
        </div>
      </div>

      {/* TOC */}
      <div style={{ position: 'sticky', top: 16, alignSelf: 'flex-start', display: density === 'compact' ? 'none' : 'block' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-faint)',
          letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>On this page</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {toc.map((t, i) => (
            <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{
              fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none',
              paddingLeft: (t.level - 2) * 10, lineHeight: 1.4, borderLeft: i === 0 ? '2px solid var(--cl-accent)' : '2px solid transparent',
              paddingLeft: ((t.level - 2) * 10) + 8,
            }}>{t.text}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReaderView });
