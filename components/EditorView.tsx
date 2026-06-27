'use client';

// EditorView — Suggest-edit screen ported from legacy/views-editor.jsx.
// Write/Split/Read modes, Markdown+LaTeX textarea, live preview (incl. diagrams),
// live +/- diff vs the current note, and a submit panel that opens a PR via the
// createSuggestion server action. The legacy image/proof upload is intentionally
// dropped (MVP content-moderation decision).

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { renderMarkdown } from '@/lib/render';
import { computeDiffStats } from '@/lib/diff';
import { createSuggestion } from '@/lib/actions/suggestion';
import { Btn } from './ui';
import { I } from './icons';
import { DiagramProse } from './DiagramProse';

type Mode = 'write' | 'split' | 'read';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function EditorView({
  slug,
  noteSlug,
  noteTitle,
  version,
  baseBody,
}: {
  slug: string;
  noteSlug: string;
  noteTitle: string;
  version: number;
  baseBody: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(baseBody);
  const [mode, setMode] = useState<Mode>('split');
  const [showSubmit, setShowSubmit] = useState(false);
  const [title, setTitle] = useState(`Refine ${noteTitle}`);
  const [summary, setSummary] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounced(draft, 250);
  const html = useMemo(() => renderMarkdown(debounced), [debounced]);
  const stats = useMemo(() => {
    const { add, del } = computeDiffStats(baseBody, draft);
    return { add, del, delta: draft.length - baseBody.length };
  }, [draft, baseBody]);

  const dirty = draft.trim() !== baseBody.trim();

  async function submit() {
    setPending(true);
    setError(null);
    const res = await createSuggestion(slug, noteSlug, {
      title: title.trim(),
      summary: summary.trim(),
      proposedBody: draft,
    });
    // On success the action redirects; we only get here on failure.
    setPending(false);
    if (res && res.ok === false) setError(res.error ?? 'Could not submit.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 53px)', background: 'var(--cl-bg)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--cl-line)', background: 'var(--cl-surface)' }}>
        <Btn variant="ghost" size="sm" onClick={() => router.push(`/${slug}/n/${noteSlug}`)} icon={I.x(12)}>
          Cancel
        </Btn>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>Editing draft of</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{noteTitle} · v{version}</div>
        </div>

        <div style={{ display: 'flex', background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', padding: 2 }}>
          {([
            { v: 'write', icon: I.write(12), label: 'Write' },
            { v: 'split', icon: I.split(12), label: 'Split' },
            { v: 'read', icon: I.eye(12), label: 'Read' },
          ] as const).map((o) => (
            <button
              key={o.v}
              onClick={() => setMode(o.v)}
              style={{
                appearance: 'none', border: 'none',
                background: mode === o.v ? 'var(--cl-bg)' : 'transparent',
                color: mode === o.v ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
                padding: '4px 10px', borderRadius: 'calc(var(--cl-radius) - 2px)', fontSize: 12,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                boxShadow: mode === o.v ? '0 1px 2px rgba(0,0,0,.06)' : 'none', fontWeight: 500,
              }}
            >
              {o.icon}{o.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)', padding: '4px 10px', borderRadius: 'var(--cl-radius)', background: 'var(--cl-chip)', display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--cl-diff-add-ink)' }}>+{stats.add}</span>
          <span style={{ color: 'var(--cl-diff-del-ink)' }}>−{stats.del}</span>
          <span>{stats.delta >= 0 ? '+' : ''}{stats.delta} chars</span>
        </div>

        <Btn variant="primary" size="sm" onClick={() => setShowSubmit(true)} icon={I.branch(12)} disabled={!dirty}>
          Submit PR
        </Btn>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: mode === 'split' ? '1fr 1fr' : '1fr' }}>
        {(mode === 'write' || mode === 'split') && (
          <div style={{ borderRight: mode === 'split' ? '1px solid var(--cl-line)' : 'none', display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-ink-faint)', letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 16px', borderBottom: '1px solid var(--cl-line-soft)' }}>
              Markdown · LaTeX · ```graph / ```mermaid
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              style={{ flex: 1, padding: 20, border: 'none', outline: 'none', resize: 'none', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 13, lineHeight: 1.65, background: 'var(--cl-bg)', color: 'var(--cl-ink)', tabSize: 2 }}
            />
          </div>
        )}
        {(mode === 'read' || mode === 'split') && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, background: 'var(--cl-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-ink-faint)', letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 16px', borderBottom: '1px solid var(--cl-line-soft)' }}>
              Live preview
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
              <DiagramProse html={html} />
            </div>
          </div>
        )}
      </div>

      {showSubmit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} onClick={() => !pending && setShowSubmit(false)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,.25)' }} />
          <div onClick={(e) => e.stopPropagation()} className="cl-slidein" style={{ width: 460, maxWidth: '100%', background: 'var(--cl-bg)', borderLeft: '1px solid var(--cl-line)', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 40px rgba(0,0,0,.12)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cl-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--cl-accent)', display: 'flex' }}>{I.branch(16)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Submit pull request</div>
                <div style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)' }}>On <strong style={{ color: 'var(--cl-ink-soft)', fontWeight: 500 }}>{noteTitle}</strong> · v{version}</div>
              </div>
            </div>
            <div style={{ padding: 20, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '10px 12px', background: 'var(--cl-surface)', border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
                <span style={{ color: 'var(--cl-ink-faint)' }}>Changes</span>
                <span style={{ color: 'var(--cl-diff-add-ink)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>+{stats.add}</span>
                <span style={{ color: 'var(--cl-diff-del-ink)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>−{stats.del}</span>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-soft)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 120))} style={fieldStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-soft)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Summary</span>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What did you change and why?" rows={5} style={{ ...fieldStyle, resize: 'vertical', minHeight: 100 }} />
              </label>
              {error && <div style={{ color: 'var(--cl-danger)', fontSize: 13 }}>{error}</div>}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--cl-line)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" size="sm" onClick={() => setShowSubmit(false)} disabled={pending}>Cancel</Btn>
              <Btn variant="primary" size="sm" onClick={submit} disabled={pending || !title.trim() || !summary.trim()} icon={I.branch(12)}>
                {pending ? 'Submitting…' : 'Submit pull request'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--cl-line)',
  borderRadius: 'var(--cl-radius)',
  background: 'var(--cl-bg)',
  color: 'var(--cl-ink)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box' as const,
};
