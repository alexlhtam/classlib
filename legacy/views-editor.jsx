// views-editor.jsx — Suggest Edit screen with Write / Split / Read modes,
// live char diff counter, draft saved. Submit flow opens slide-over panel.

function EditorView({ data, noteId, theme, density, onCancel, onSubmit }) {
  const d = cl_densityScale(density);
  const note = data.NOTES.find(n => n.id === noteId);
  const [draft, setDraft] = React.useState(note.proposed || note.body);
  const [mode, setMode] = React.useState('split'); // write | split | read
  const [showSubmit, setShowSubmit] = React.useState(false);
  const [title, setTitle] = React.useState('Refine ' + note.title.toLowerCase());
  const [summary, setSummary] = React.useState('');
  const [proof, setProof] = React.useState(null);

  const html = React.useMemo(() => cl_render(draft), [draft]);
  const stats = React.useMemo(() => {
    const ad = draft.length - note.body.length;
    const lineDiff = cl_diff(note.body, draft);
    const s = cl_diffStats(lineDiff);
    return { delta: ad, ...s };
  }, [draft, note.body]);

  // Cmd+Enter to submit
  React.useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (showSubmit) { onSubmit({ title, summary, proof, draft }); }
        else { setShowSubmit(true); }
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [showSubmit, title, summary, proof, draft]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--cl-bg)', color: 'var(--cl-ink)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderBottom: '1px solid var(--cl-line)',
        background: 'var(--cl-surface)',
      }}>
        <Btn variant="ghost" size="sm" onClick={onCancel} icon={I.x(12)}>Cancel</Btn>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>Editing draft of</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--cl-ink)' }}>{note.title}</div>
        </div>

        {/* Mode segmented */}
        <div style={{
          display: 'flex', background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', padding: 2,
        }}>
          {[
            { v: 'write', icon: I.write(12), label: 'Write' },
            { v: 'split', icon: I.split(12), label: 'Split' },
            { v: 'read', icon: I.eye(12), label: 'Read' },
          ].map(o => (
            <button key={o.v} onClick={() => setMode(o.v)} style={{
              appearance: 'none', border: 'none', background: mode === o.v ? 'var(--cl-bg)' : 'transparent',
              color: mode === o.v ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
              padding: '4px 10px', borderRadius: 'calc(var(--cl-radius) - 2px)', fontSize: 12,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
              boxShadow: mode === o.v ? '0 1px 2px rgba(0,0,0,.06)' : 'none', fontWeight: 500,
            }}>{o.icon}{o.label}</button>
          ))}
        </div>

        {/* Char diff */}
        <div style={{
          fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)',
          padding: '4px 10px', borderRadius: 'var(--cl-radius)', background: 'var(--cl-chip)',
          display: 'flex', gap: 8,
        }}>
          <span style={{ color: 'var(--cl-diff-add-ink)' }}>+{stats.add}</span>
          <span style={{ color: 'var(--cl-diff-del-ink)' }}>−{stats.del}</span>
          <span>{stats.delta >= 0 ? '+' : ''}{stats.delta} chars</span>
        </div>

        <Btn variant="primary" size="sm" onClick={() => setShowSubmit(true)} icon={I.branch(12)}>
          Submit PR
        </Btn>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid',
        gridTemplateColumns: mode === 'split' ? '1fr 1fr' : '1fr',
      }}>
        {(mode === 'write' || mode === 'split') && (
          <div style={{
            borderRight: mode === 'split' ? '1px solid var(--cl-line)' : 'none',
            display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: 'var(--cl-ink-faint)',
              letterSpacing: '.06em', textTransform: 'uppercase',
              padding: '8px 16px', borderBottom: '1px solid var(--cl-line-soft)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Markdown · LaTeX</span>
              <span style={{ color: 'var(--cl-ink-faint)' }}>draft saved</span>
            </div>
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, padding: 20, border: 'none', outline: 'none', resize: 'none',
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 13, lineHeight: 1.65, background: 'var(--cl-bg)', color: 'var(--cl-ink)',
                tabSize: 2,
              }}
            />
          </div>
        )}
        {(mode === 'read' || mode === 'split') && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
            background: theme.name === 'editorial' ? 'var(--cl-surface)' : 'var(--cl-bg)' }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: 'var(--cl-ink-faint)',
              letterSpacing: '.06em', textTransform: 'uppercase',
              padding: '8px 16px', borderBottom: '1px solid var(--cl-line-soft)',
            }}>Live preview</div>
            <div className="cl-prose" style={{
              flex: 1, padding: '20px 28px', overflow: 'auto',
              fontSize: d.prose, lineHeight: 1.7,
              fontFamily: theme.serif ? 'var(--cl-body-font)' : '"Inter", system-ui, sans-serif',
            }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>

      {showSubmit && (
        <SubmitPRPanel
          theme={theme} stats={stats} note={note}
          title={title} setTitle={setTitle}
          summary={summary} setSummary={setSummary}
          proof={proof} setProof={setProof}
          onClose={() => setShowSubmit(false)}
          onSubmit={() => onSubmit({ title, summary, proof, draft })}
        />
      )}
    </div>
  );
}

// ── Slide-over Submit PR panel ──────────────────────────────
function SubmitPRPanel({ theme, stats, note, title, setTitle, summary, setSummary,
  proof, setProof, onClose, onSubmit }) {
  React.useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex' }}
      onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,.25)', backdropFilter: 'blur(2px)' }} />
      <div onClick={(e) => e.stopPropagation()}
        className="cl-slidein"
        style={{
          width: 460, background: 'var(--cl-bg)', borderLeft: '1px solid var(--cl-line)',
          display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 40px rgba(0,0,0,.12)',
        }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--cl-line)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: 'var(--cl-accent)', display: 'flex' }}>{I.branch(16)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Submit pull request</div>
            <div style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)' }}>
              On <strong style={{ color: 'var(--cl-ink-soft)', fontWeight: 500 }}>{note.title}</strong> · v{note.version}
            </div>
          </div>
          <IconBtn onClick={onClose} title="Close">{I.x(14)}</IconBtn>
        </div>

        <div style={{ padding: '20px', flex: 1, overflow: 'auto', display: 'flex',
          flexDirection: 'column', gap: 16 }}>
          {/* Diff snapshot */}
          <div style={{
            padding: '10px 12px', background: 'var(--cl-surface)',
            border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
            display: 'flex', alignItems: 'center', gap: 16, fontSize: 12,
          }}>
            <span style={{ color: 'var(--cl-ink-faint)' }}>Changes</span>
            <span style={{ color: 'var(--cl-diff-add-ink)', fontWeight: 600,
              fontFamily: 'ui-monospace, monospace' }}>+{stats.add}</span>
            <span style={{ color: 'var(--cl-diff-del-ink)', fontWeight: 600,
              fontFamily: 'ui-monospace, monospace' }}>−{stats.del}</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: 'var(--cl-ink-faint)', fontSize: 11 }}>{stats.delta >= 0 ? '+' : ''}{stats.delta} chars</span>
          </div>

          <Field label="Title" hint={`${title.length}/80`}>
            <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              style={inputStyle()} />
          </Field>

          <Field label="Summary" hint="Markdown supported">
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
              placeholder="What did you change and why? Link related notes if helpful."
              rows={5} style={{ ...inputStyle(), resize: 'vertical', minHeight: 100,
                fontFamily: 'inherit' }} />
          </Field>

          <Field label="Proof / source" hint="Optional">
            <ProofUpload proof={proof} setProof={setProof} />
          </Field>

          <Field label="Reviewers">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['prof.kale', 's.thatcher'].map(r => (
                <span key={r} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px 4px 4px', borderRadius: 999,
                  background: 'var(--cl-chip)', fontSize: 12,
                }}>
                  <Avatar name={r} size={18} />
                  {r}
                </span>
              ))}
              <button style={{
                appearance: 'none', border: '1px dashed var(--cl-line)', background: 'transparent',
                color: 'var(--cl-ink-soft)', padding: '4px 10px', borderRadius: 999,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Add</button>
            </div>
          </Field>

          <Field label="Settings">
            <Toggle label="Notify maintainers via email" defaultOn />
            <Toggle label="Auto-merge if 2 maintainers approve" />
          </Field>
        </div>

        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--cl-line)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)', flex: 1,
            fontFamily: 'ui-monospace, monospace' }}>⌘ + Enter</span>
          <Btn variant="secondary" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" onClick={onSubmit}
            disabled={!title.trim() || !summary.trim()} icon={I.branch(12)}>
            Submit pull request
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-soft)',
          letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function inputStyle() {
  return {
    width: '100%', padding: '8px 12px',
    border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
    background: 'var(--cl-bg)', color: 'var(--cl-ink)',
    fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };
}

function Toggle({ label, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--cl-ink-soft)',
      padding: '4px 0', cursor: 'pointer' }}>
      <button type="button" onClick={() => setOn(!on)} style={{
        appearance: 'none', border: 'none', width: 28, height: 16,
        borderRadius: 999, background: on ? 'var(--cl-accent)' : 'var(--cl-line)',
        position: 'relative', cursor: 'pointer', transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 14 : 2, width: 12, height: 12,
          background: '#fff', borderRadius: '50%', transition: 'left .15s',
          boxShadow: '0 1px 2px rgba(0,0,0,.2)',
        }} />
      </button>
      {label}
    </label>
  );
}

function ProofUpload({ proof, setProof }) {
  const ref = React.useRef(null);
  const onPick = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setProof({ name: f.name, size: f.size, dataUrl: reader.result });
    reader.readAsDataURL(f);
  };
  if (proof) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
        border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
        background: 'var(--cl-surface)',
      }}>
        {proof.dataUrl?.startsWith('data:image') ? (
          <img src={proof.dataUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
        ) : <span style={{ color: 'var(--cl-ink-faint)' }}>{I.doc(20)}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proof.name}</div>
          <div style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>{Math.round(proof.size / 1024)} KB</div>
        </div>
        <IconBtn onClick={() => setProof(null)} title="Remove">{I.x(12)}</IconBtn>
      </div>
    );
  }
  return (
    <div onClick={() => ref.current?.click()} style={{
      padding: '14px 16px', textAlign: 'center', cursor: 'pointer',
      border: '1px dashed var(--cl-line)', borderRadius: 'var(--cl-radius)',
      color: 'var(--cl-ink-soft)', fontSize: 12, background: 'var(--cl-surface)',
    }}>
      <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={onPick} />
      Drop a screenshot, photo of a textbook page, or PDF. <span style={{ color: 'var(--cl-accent)' }}>Browse →</span>
    </div>
  );
}

Object.assign(window, { EditorView, SubmitPRPanel, Field, Toggle, ProofUpload, inputStyle });
