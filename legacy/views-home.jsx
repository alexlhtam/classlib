// views.jsx — the screens of the prototype.
// Home (modules), NoteList, Reader, Editor, PRSubmit, PRList, PRReview.

// ── Module/Notes home ──────────────────────────────────────────
function HomeView({ data, theme, density, onOpenModule, onSearch, search, role }) {
  const d = cl_densityScale(density);
  const filtered = data.MODULES.filter(m =>
    !search || (m.title + ' ' + m.code + ' ' + m.description).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: `${d.pad + 12}px ${d.pad + 8}px`, color: 'var(--cl-ink)' }}>
      {/* Hero */}
      <div style={{ marginBottom: d.gap + 8 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--cl-accent)',
          letterSpacing: theme.name === 'editorial' ? '.16em' : '.06em',
          textTransform: 'uppercase', marginBottom: 8,
          fontVariant: theme.name === 'editorial' ? 'small-caps' : 'normal' }}>
          {theme.name === 'editorial' ? 'classlib · vol. ix' : 'classlib'}
        </div>
        <h1 style={{
          margin: 0, fontSize: theme.name === 'editorial' ? 38 : 30, fontWeight: theme.name === 'editorial' ? 500 : 600,
          letterSpacing: theme.name === 'editorial' ? -0.6 : -0.4, lineHeight: 1.1,
          fontFamily: 'var(--cl-body-font)',
        }}>
          {theme.name === 'editorial' ? 'A library of class notes, kept by everyone.' :
           theme.name === 'dense' ? 'Modules' :
           'Course notes, written together.'}
        </h1>
        {theme.name !== 'dense' && (
          <p style={{ margin: '12px 0 0', maxWidth: 560, color: 'var(--cl-ink-soft)',
            fontSize: theme.name === 'editorial' ? 17 : 15, lineHeight: 1.55 }}>
            {theme.name === 'editorial'
              ? 'Read the canonical version. Suggest a change. Maintainers review every edit before it lands — so the notes stay accurate, and credit lands where it should.'
              : 'Browse module-canonical notes, suggest improvements, and review pull requests from your peers.'}
          </p>
        )}
      </div>

      {/* Search row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.gap,
        background: 'var(--cl-surface)', border: '1px solid var(--cl-line)',
        borderRadius: 'var(--cl-radius)', padding: '8px 12px',
      }}>
        <span style={{ color: 'var(--cl-ink-faint)', display: 'flex' }}>{I.search(15)}</span>
        <input value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search modules, notes, authors…"
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            color: 'var(--cl-ink)', fontSize: 14, fontFamily: 'inherit',
          }} />
        <span style={{ color: 'var(--cl-ink-faint)', fontSize: 11, fontFamily: 'ui-monospace, monospace',
          padding: '2px 6px', border: '1px solid var(--cl-line)', borderRadius: 4 }}>⌘K</span>
      </div>

      {/* Module grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: density === 'compact' ? 8 : 12,
      }}>
        {filtered.map((m) => <ModuleCard key={m.id} m={m} theme={theme} density={density} onClick={() => onOpenModule(m.id)} />)}
      </div>

      {/* Recent activity */}
      <div style={{ marginTop: d.gap + 16 }}>
        <SectionHeader theme={theme}>Recent activity</SectionHeader>
        <ActivityFeed data={data} theme={theme} role={role} />
      </div>
    </div>
  );
}

function ModuleCard({ m, theme, density, onClick }) {
  const d = cl_densityScale(density);
  return (
    <div onClick={onClick} className="cl-card cl-fade"
      style={{
        padding: d.pad, border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
        background: 'var(--cl-bg)', cursor: 'pointer', transition: 'border-color .12s, transform .12s',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cl-accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--cl-line)'}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)',
          letterSpacing: '.04em' }}>{m.code}</span>
        <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>{m.noteCount} notes · {m.contributors} contributors</span>
      </div>
      <div style={{
        fontSize: theme.name === 'editorial' ? 22 : 17, fontWeight: theme.name === 'editorial' ? 500 : 600,
        color: 'var(--cl-ink)', letterSpacing: -0.2, fontFamily: 'var(--cl-body-font)',
      }}>{m.title}</div>
      {density !== 'compact' && (
        <div style={{ fontSize: 13, color: 'var(--cl-ink-soft)', lineHeight: 1.5 }}>{m.description}</div>
      )}
    </div>
  );
}

function SectionHeader({ children, theme }) {
  return <div style={{
    fontSize: theme.name === 'dense' ? 11 : 12, fontWeight: 600,
    color: 'var(--cl-ink-soft)',
    letterSpacing: theme.name === 'editorial' ? '.18em' : '.06em',
    textTransform: 'uppercase', marginBottom: 12,
    fontVariant: theme.name === 'editorial' ? 'small-caps' : 'normal',
    paddingBottom: 6, borderBottom: '1px solid var(--cl-line-soft)',
  }}>{children}</div>;
}

function ActivityFeed({ data, theme, role }) {
  const items = [
    { kind: 'pr', text: 'Aria Lin opened a PR on Merge Sort', sub: '"Add proof sketch + overflow-safe midpoint"', time: '6h' },
    { kind: 'merge', text: 'Aria Lin merged a PR on Quicksort', sub: '"Add introselect alternative"', time: '5d' },
    { kind: 'edit', text: 'Stella Thatcher published Dijkstra v7', sub: '— rewrote the running-time section', time: '4d' },
    { kind: 'pr', text: 'Rita Okafor opened a PR on Binary Heaps', sub: '"Tighten build-heap derivation"', time: '3d' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
        }}>
          <span style={{
            color: it.kind === 'merge' ? '#6E40C9' : it.kind === 'pr' ? 'var(--cl-accent)' : 'var(--cl-ink-soft)',
            display: 'flex',
          }}>
            {it.kind === 'merge' ? I.check(14) : it.kind === 'pr' ? I.pr(14) : I.pencil(14)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--cl-ink)' }}>{it.text}</div>
            <div style={{ fontSize: 12, color: 'var(--cl-ink-soft)', marginTop: 2,
              fontStyle: theme.name === 'editorial' ? 'italic' : 'normal' }}>{it.sub}</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)', flexShrink: 0,
            fontFamily: 'ui-monospace, monospace' }}>{it.time}</span>
        </div>
      ))}
    </div>
  );
}

// ── Module page (notes list) ──────────────────────────────────
function ModuleView({ data, moduleId, theme, density, onBack, onOpenNote }) {
  const d = cl_densityScale(density);
  const m = data.MODULES.find(x => x.id === moduleId);
  const notes = data.NOTES.filter(n => n.module === moduleId);
  return (
    <div style={{ padding: d.pad + 12, color: 'var(--cl-ink)' }}>
      <Btn variant="ghost" size="sm" onClick={onBack} icon={I.back(12)} style={{ marginBottom: 16, marginLeft: -8 }}>
        All modules
      </Btn>
      <div style={{ marginBottom: d.gap }}>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)',
          letterSpacing: '.06em', marginBottom: 6 }}>{m.code}</div>
        <h1 style={{ margin: 0, fontSize: theme.name === 'editorial' ? 32 : 26,
          fontWeight: theme.name === 'editorial' ? 500 : 600, letterSpacing: -0.4,
          fontFamily: 'var(--cl-body-font)' }}>{m.title}</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--cl-ink-soft)', fontSize: 14 }}>{m.description}</p>
      </div>
      <SectionHeader theme={theme}>{notes.length} notes</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {notes.map((n, i) => (
          <div key={n.id} className="cl-fade" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: `${d.row + 2}px 0`,
            borderBottom: i === notes.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
            cursor: 'pointer',
          }} onClick={() => onOpenNote(n.id)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cl-line-soft)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--cl-ink-faint)', display: 'flex' }}>{I.doc(14)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--cl-ink)' }}>{n.title}</span>
                <StatusBadge status={n.status} theme={theme.badge} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)', marginTop: 3,
                display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>v{n.version}</span>
                <span>·</span>
                <span>{n.author}</span>
                <span>·</span>
                <span>updated {n.updated}</span>
                {n.tags.map(t => <Chip key={t}>{t}</Chip>)}
              </div>
            </div>
            <span style={{ color: 'var(--cl-ink-faint)' }}>{I.arrow(12)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeView, ModuleView, ModuleCard, SectionHeader, ActivityFeed });
