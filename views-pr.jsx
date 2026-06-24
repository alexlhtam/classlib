// views-pr.jsx — PR list (maintainer view) and PR review screen with diff.

function PRListView({ data, theme, density, onOpenPR }) {
  const d = cl_densityScale(density);
  const [filter, setFilter] = React.useState('open');
  const filtered = data.PRS.filter(p => filter === 'all' || p.status === filter);
  return (
    <div style={{ padding: `${d.pad + 12}px ${d.pad + 8}px`, color: 'var(--cl-ink)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: theme.name === 'editorial' ? 30 : 24,
          fontWeight: theme.name === 'editorial' ? 500 : 600,
          fontFamily: 'var(--cl-body-font)', letterSpacing: -0.3 }}>Pull requests</h1>
        <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--cl-chip)',
          borderRadius: 'var(--cl-radius)' }}>
          {['open', 'merged', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              appearance: 'none', border: 'none',
              background: filter === f ? 'var(--cl-bg)' : 'transparent',
              color: filter === f ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
              padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 'calc(var(--cl-radius) - 2px)',
              cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              boxShadow: filter === f ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}>{f} {f === 'open' && <span style={{ color: 'var(--cl-ink-faint)', marginLeft: 4 }}>{data.PRS.filter(p => p.status === 'open').length}</span>}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column',
        border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
        overflow: 'hidden' }}>
        {filtered.map((pr, i) => {
          const note = data.NOTES.find(n => n.id === pr.noteId);
          return (
            <div key={pr.id} onClick={() => onOpenPR(pr.id)}
              className="cl-fade"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: `${d.row + 4}px ${d.pad}px`,
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
                cursor: 'pointer', background: 'var(--cl-bg)', transition: 'background .12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cl-line-soft)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--cl-bg)'}
            >
              <span style={{ color: pr.status === 'merged' ? '#6E40C9' : 'var(--cl-success)',
                marginTop: 3, display: 'flex' }}>{pr.status === 'merged' ? I.check(15) : I.pr(15)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--cl-ink)' }}>{pr.title}</span>
                  <StatusBadge status={pr.status} theme={theme.badge} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--cl-ink-faint)', marginTop: 4,
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>{pr.id}</span>
                  <span>·</span>
                  <span>on <strong style={{ color: 'var(--cl-ink-soft)', fontWeight: 500 }}>{note?.title}</strong></span>
                  <span>·</span>
                  <span>by</span>
                  <Avatar name={pr.author} size={14} />
                  <span>{pr.author}</span>
                  <span>·</span>
                  <span>{pr.opened}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5,
                color: 'var(--cl-ink-faint)', fontFamily: 'ui-monospace, monospace' }}>
                <span style={{ color: 'var(--cl-diff-add-ink)' }}>+{pr.additions}</span>
                <span style={{ color: 'var(--cl-diff-del-ink)' }}>−{pr.deletions}</span>
                {pr.reviewers > 0 && (
                  <span title="Reviewers" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {I.user(11)} {pr.reviewers}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PR Review (diff) ──────────────────────────────────────────
function PRReviewView({ data, prId, theme, density, role, onBack, onApprove, onReject }) {
  const d = cl_densityScale(density);
  const pr = data.PRS.find(p => p.id === prId);
  const note = data.NOTES.find(n => n.id === pr.noteId);
  const [diffMode, setDiffMode] = React.useState('inline'); // inline | sbs | rendered
  const oldText = pr.base || note.body;
  const newText = pr.body || note.proposed || note.body;
  const lineDiff = React.useMemo(() => cl_diff(oldText, newText), [oldText, newText]);
  const stats = cl_diffStats(lineDiff);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
      color: 'var(--cl-ink)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cl-line)',
        background: 'var(--cl-surface)' }}>
        <Btn variant="ghost" size="sm" onClick={onBack} icon={I.back(12)} style={{ marginBottom: 8, marginLeft: -8 }}>
          Pull requests
        </Btn>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: theme.name === 'editorial' ? 22 : 19,
                fontWeight: 600, color: 'var(--cl-ink)', fontFamily: 'var(--cl-body-font)' }}>
                {pr.title}
              </h1>
              <span style={{ fontSize: 13, color: 'var(--cl-ink-faint)',
                fontFamily: 'ui-monospace, monospace' }}>{pr.id}</span>
              <StatusBadge status={pr.status} theme={theme.badge} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--cl-ink-soft)',
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Avatar name={pr.author} size={16} />
              <strong style={{ fontWeight: 500 }}>{pr.authorFull || pr.author}</strong>
              <span>wants to merge into</span>
              <span style={{ fontFamily: 'ui-monospace, monospace',
                background: 'var(--cl-chip)', padding: '1px 6px', borderRadius: 4 }}>{note.title}</span>
              <span>· {pr.opened}</span>
            </div>
          </div>
          {role === 'maintainer' && pr.status === 'open' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="danger" size="sm" onClick={() => onReject(pr.id)} icon={I.x(12)}>Request changes</Btn>
              <Btn variant="success" size="sm" onClick={() => onApprove(pr.id)} icon={I.check(12)}>Approve & merge</Btn>
            </div>
          )}
        </div>
      </div>

      {/* Summary + checks */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cl-line-soft)',
        display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-faint)',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Summary</div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--cl-ink-soft)',
            fontStyle: theme.name === 'editorial' ? 'italic' : 'normal' }}>{pr.summary}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          <ChecksRow ok label="LaTeX builds clean" />
          <ChecksRow ok label="No broken links" />
          <ChecksRow ok={pr.checks === 'passing'} pending={pr.checks === 'pending'} label="2 reviewers · prof.kale, s.thatcher" />
        </div>
      </div>

      {/* Diff toolbar */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--cl-line)',
        background: 'var(--cl-surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--cl-ink-soft)' }}>Showing changes</span>
        <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-diff-add-ink)' }}>+{stats.add}</span>
        <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-diff-del-ink)' }}>−{stats.del}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', padding: 2 }}>
          {[
            { v: 'inline', label: 'Inline', icon: I.write(12) },
            { v: 'sbs', label: 'Side-by-side', icon: I.split(12) },
            { v: 'rendered', label: 'Rendered', icon: I.eye(12) },
          ].map(o => (
            <button key={o.v} onClick={() => setDiffMode(o.v)} style={{
              appearance: 'none', border: 'none', background: diffMode === o.v ? 'var(--cl-bg)' : 'transparent',
              color: diffMode === o.v ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
              padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 'calc(var(--cl-radius) - 2px)',
              cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5,
              boxShadow: diffMode === o.v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}>{o.icon}{o.label}</button>
          ))}
        </div>
      </div>

      {/* Diff body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--cl-bg)' }}>
        {diffMode === 'inline' && <InlineDiff lines={lineDiff} />}
        {diffMode === 'sbs' && <SideBySideDiff lines={lineDiff} />}
        {diffMode === 'rendered' && <RenderedDiff oldText={oldText} newText={newText} theme={theme} d={d} />}
      </div>
    </div>
  );
}

function ChecksRow({ ok, pending, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 14, height: 14, borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: pending ? 'var(--cl-chip)' : ok ? 'rgba(22,163,74,.12)' : 'rgba(220,38,38,.12)',
        color: pending ? 'var(--cl-ink-faint)' : ok ? 'var(--cl-success)' : 'var(--cl-danger)', flexShrink: 0,
      }}>
        {pending ? <span style={{ fontSize: 9 }}>…</span> : ok ? I.check(9) : I.x(9)}
      </span>
      <span style={{ color: 'var(--cl-ink-soft)' }}>{label}</span>
    </div>
  );
}

function InlineDiff({ lines }) {
  return (
    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      fontSize: 12.5, lineHeight: 1.6 }}>
      {lines.map((l, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '40px 40px 18px 1fr', alignItems: 'baseline',
          background: l.kind === 'add' ? 'var(--cl-diff-add)' : l.kind === 'del' ? 'var(--cl-diff-del)' : 'transparent',
          color: l.kind === 'add' ? 'var(--cl-diff-add-ink)' : l.kind === 'del' ? 'var(--cl-diff-del-ink)' : 'var(--cl-ink)',
        }}>
          <span style={{ textAlign: 'right', padding: '0 8px', color: 'var(--cl-ink-faint)',
            fontSize: 11, userSelect: 'none' }}>{l.oldLine ?? ''}</span>
          <span style={{ textAlign: 'right', padding: '0 8px', color: 'var(--cl-ink-faint)',
            fontSize: 11, userSelect: 'none' }}>{l.newLine ?? ''}</span>
          <span style={{ textAlign: 'center', userSelect: 'none', fontWeight: 600, opacity: 0.7 }}>
            {l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' '}
          </span>
          <span style={{ paddingRight: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{l.text || '\u00A0'}</span>
        </div>
      ))}
    </div>
  );
}

function SideBySideDiff({ lines }) {
  // Pair add/del so deletions and additions sit on the same row.
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.kind === 'same') { rows.push({ left: l, right: l }); continue; }
    if (l.kind === 'del') {
      const next = lines[i + 1];
      if (next && next.kind === 'add') {
        rows.push({ left: l, right: next, paired: true }); i++;
      } else {
        rows.push({ left: l, right: null });
      }
    } else if (l.kind === 'add') {
      rows.push({ left: null, right: l });
    }
  }
  return (
    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12.5, lineHeight: 1.6,
      display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ borderRight: '1px solid var(--cl-line)' }}>
        {rows.map((r, i) => (
          <DiffSide key={i} side={r.left} kind="del" paired={r.paired} other={r.right} />
        ))}
      </div>
      <div>
        {rows.map((r, i) => (
          <DiffSide key={i} side={r.right} kind="add" paired={r.paired} other={r.left} />
        ))}
      </div>
    </div>
  );
}

function DiffSide({ side, kind, paired, other }) {
  if (!side) {
    return <div style={{ minHeight: '1.6em', background: 'var(--cl-line-soft)', opacity: 0.4 }}>&nbsp;</div>;
  }
  const isChange = side.kind !== 'same';
  let content = side.text;
  // Word-level highlight if paired add/del
  if (paired && other && side.kind !== 'same') {
    const wd = cl_wordDiff(other.text, side.text);
    const parts = side.kind === 'add' ? wd.right : wd.left;
    content = parts.map((p, i) => (
      <span key={i} style={{
        background: (p.k === 'a' && side.kind === 'add') ? 'rgba(22,163,74,.22)'
          : (p.k === 'd' && side.kind === 'del') ? 'rgba(220,38,38,.22)'
          : 'transparent',
        borderRadius: 2,
      }}>{p.t}</span>
    ));
  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 18px 1fr', alignItems: 'baseline',
      background: isChange && side.kind === 'add' ? 'var(--cl-diff-add)' :
                  isChange && side.kind === 'del' ? 'var(--cl-diff-del)' : 'transparent',
      color: isChange && side.kind === 'add' ? 'var(--cl-diff-add-ink)' :
             isChange && side.kind === 'del' ? 'var(--cl-diff-del-ink)' : 'var(--cl-ink)',
    }}>
      <span style={{ textAlign: 'right', padding: '0 8px', color: 'var(--cl-ink-faint)',
        fontSize: 11, userSelect: 'none' }}>{kind === 'del' ? side.oldLine : side.newLine || ''}</span>
      <span style={{ textAlign: 'center', userSelect: 'none', fontWeight: 600, opacity: 0.7 }}>
        {side.kind === 'add' ? '+' : side.kind === 'del' ? '−' : ' '}
      </span>
      <span style={{ paddingRight: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content || '\u00A0'}</span>
    </div>
  );
}

function RenderedDiff({ oldText, newText, theme, d }) {
  const oldHtml = React.useMemo(() => cl_render(oldText), [oldText]);
  const newHtml = React.useMemo(() => cl_render(newText), [newText]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
      <div style={{ borderRight: '1px solid var(--cl-line)', overflow: 'auto', padding: '20px 28px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-diff-del-ink)',
          letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Before</div>
        <div className="cl-prose" style={{ fontSize: d.prose, lineHeight: 1.7,
          fontFamily: theme.serif ? 'var(--cl-body-font)' : '"Inter", system-ui, sans-serif',
        }} dangerouslySetInnerHTML={{ __html: oldHtml }} />
      </div>
      <div style={{ overflow: 'auto', padding: '20px 28px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-diff-add-ink)',
          letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>After</div>
        <div className="cl-prose" style={{ fontSize: d.prose, lineHeight: 1.7,
          fontFamily: theme.serif ? 'var(--cl-body-font)' : '"Inter", system-ui, sans-serif',
        }} dangerouslySetInnerHTML={{ __html: newHtml }} />
      </div>
    </div>
  );
}

Object.assign(window, { PRListView, PRReviewView, InlineDiff, SideBySideDiff, RenderedDiff });
