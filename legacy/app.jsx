// app.jsx — top-level KnowledgeCanvas, locked to the editorial-serif direction.
// The original design explored three aesthetic directions on a pannable canvas;
// this implementation ships only the "editorial" preset as the real app.

function KnowledgeCanvas({ initialView = 'home', initialNote = null, initialPR = null, initialRole = 'student' }) {
  const data = window.CLASSLIB_DATA;

  // Editorial-serif is the chosen direction. Derive the theme from the preset
  // and compute accent-tint the same way the prototype did.
  const baseTheme = window.CL_THEME_PRESETS.editorial;
  const theme = React.useMemo(() => {
    const t = { ...baseTheme };
    t.accentTint = `color-mix(in oklab, ${t.accent} 14%, transparent)`;
    return t;
  }, [baseTheme]);

  const density = baseTheme.density;
  const dark = false;
  const themeStyle = window.cl_themeStyle(theme, dark);

  // Nav state: view = home | module | reader | editor | prlist | prreview
  const [view, setView] = React.useState(initialView);
  const [moduleId, setModuleId] = React.useState('algorithms');
  const [noteId, setNoteId] = React.useState(initialNote || 'mergesort');
  const [prId, setPrId] = React.useState(initialPR || 'pr-142');
  const [role, setRole] = React.useState(initialRole);
  const [search, setSearch] = React.useState('');
  const [history, setHistory] = React.useState([]); // for back-stack on PR approve

  const toast = useToast();

  const go = (v, opts = {}) => {
    setHistory((h) => [...h, { view, moduleId, noteId, prId }]);
    setView(v);
    if (opts.moduleId) setModuleId(opts.moduleId);
    if (opts.noteId) setNoteId(opts.noteId);
    if (opts.prId) setPrId(opts.prId);
  };
  const back = () => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setView(prev.view);
        setModuleId(prev.moduleId); setNoteId(prev.noteId); setPrId(prev.prId);
        return h.slice(0, -1);
      }
      setView('home');
      return h;
    });
  };

  const onSubmitPR = ({ title, summary }) => {
    toast(`Pull request submitted: "${title}"`, { kind: 'success' });
    setView('reader');
  };
  const onApprove = (id) => {
    toast(`PR ${id} approved & merged`, { kind: 'success' });
    setView('prlist');
  };
  const onReject = (id) => {
    toast(`Changes requested on ${id}`, {});
    setView('prlist');
  };

  return (
    <div className="cl-root" style={{
      ...themeStyle,
      width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: 'var(--cl-bg)', color: 'var(--cl-ink)',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      colorScheme: dark ? 'dark' : 'light',
    }}>
      {/* Top bar */}
      <TopBar theme={theme} role={role} setRole={setRole}
        onHome={() => { setHistory([]); setView('home'); }}
        onPRs={() => go('prlist')}
        view={view} prCount={data.PRS.filter(p => p.status === 'open').length} />

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
        {view === 'home' && (
          <HomeView data={data} theme={theme} density={density} role={role}
            search={search} onSearch={setSearch}
            onOpenModule={(id) => go('module', { moduleId: id })} />
        )}
        {view === 'module' && (
          <ModuleView data={data} moduleId={moduleId} theme={theme} density={density}
            onBack={back} onOpenNote={(id) => go('reader', { noteId: id })} />
        )}
        {view === 'reader' && (
          <ReaderView data={data} noteId={noteId} theme={theme} density={density} role={role}
            onBack={back}
            onSuggestEdit={() => go('editor', { noteId })}
            onViewPRs={() => go('prlist')} />
        )}
        {view === 'editor' && (
          <EditorView data={data} noteId={noteId} theme={theme} density={density}
            onCancel={back} onSubmit={onSubmitPR} />
        )}
        {view === 'prlist' && (
          <PRListView data={data} theme={theme} density={density}
            onOpenPR={(id) => go('prreview', { prId: id })} />
        )}
        {view === 'prreview' && (
          <PRReviewView data={data} prId={prId} theme={theme} density={density} role={role}
            onBack={back} onApprove={onApprove} onReject={onReject} />
        )}
      </div>
    </div>
  );
}

function TopBar({ theme, role, setRole, onHome, onPRs, view, prCount }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 18px', borderBottom: '1px solid var(--cl-line)',
      background: 'var(--cl-bg)', flexShrink: 0,
    }}>
      <button onClick={onHome} style={{
        appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8, padding: 0, fontFamily: 'inherit',
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: theme.name === 'editorial' ? 0 : 5,
          background: 'var(--cl-ink)', color: 'var(--cl-bg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, fontFamily: theme.name === 'editorial' ? '"Source Serif 4", serif' : 'inherit',
          letterSpacing: theme.name === 'editorial' ? -0.5 : 0,
        }}>{theme.name === 'editorial' ? 'cl' : '⚡'}</span>
        <span style={{
          fontSize: 14, fontWeight: 600, color: 'var(--cl-ink)',
          fontFamily: theme.serif ? 'var(--cl-body-font)' : 'inherit',
          letterSpacing: theme.name === 'editorial' ? -0.2 : 0,
        }}>classlib</span>
      </button>

      <span style={{ fontSize: 12, color: 'var(--cl-ink-faint)', marginLeft: 4 }}>/</span>
      <span style={{ fontSize: 12.5, color: 'var(--cl-ink-soft)' }}>algorithms</span>

      <div style={{ flex: 1 }} />

      <button onClick={onPRs} style={{
        appearance: 'none', border: '1px solid var(--cl-line)', background: view === 'prlist' || view === 'prreview' ? 'var(--cl-chip)' : 'transparent',
        color: 'var(--cl-ink)', padding: '5px 12px', borderRadius: 'var(--cl-radius)',
        fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        {I.pr(13)} Pull requests
        {prCount > 0 && <span style={{
          background: 'var(--cl-accent)', color: '#fff', fontSize: 10,
          padding: '0 5px', borderRadius: 8, fontFamily: 'ui-monospace, monospace',
          minWidth: 14, textAlign: 'center',
        }}>{prCount}</span>}
      </button>

      {/* Role switcher */}
      <div style={{
        display: 'flex', background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', padding: 2,
      }}>
        {['student', 'maintainer'].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            appearance: 'none', border: 'none',
            background: role === r ? 'var(--cl-bg)' : 'transparent',
            color: role === r ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
            padding: '4px 10px', fontSize: 11.5, fontWeight: 500, borderRadius: 'calc(var(--cl-radius) - 2px)',
            cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
            boxShadow: role === r ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
          }}>{r}</button>
        ))}
      </div>

      <Avatar name={role === 'maintainer' ? 'prof.kale' : 'a.lin'} size={26} />
    </div>
  );
}

Object.assign(window, { KnowledgeCanvas, TopBar });
