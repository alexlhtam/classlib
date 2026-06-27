'use client';

// DiffViewer — Inline / Side-by-side / Rendered diff, ported from
// legacy/views-pr.jsx. Line + word diff come from lib/diff.ts; the Rendered tab
// shows pre-sanitized before/after HTML (computed server-side) via DiagramProse
// so KaTeX + diagrams render.

import { useMemo, useState } from 'react';
import { lineDiff, wordDiff, diffStats, type DiffLine } from '@/lib/diff';
import { I } from './icons';
import { DiagramProse } from './DiagramProse';

type Mode = 'inline' | 'sbs' | 'rendered';

export function DiffViewer({
  baseBody,
  proposedBody,
  beforeHtml,
  afterHtml,
}: {
  baseBody: string;
  proposedBody: string;
  beforeHtml: string;
  afterHtml: string;
}) {
  const [mode, setMode] = useState<Mode>('inline');
  const lines = useMemo(() => lineDiff(baseBody, proposedBody), [baseBody, proposedBody]);
  const stats = useMemo(() => diffStats(lines), [lines]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', marginBottom: 8, borderBottom: '1px solid var(--cl-line)' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--cl-ink-soft)' }}>Changes</span>
        <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-diff-add-ink)' }}>+{stats.add}</span>
        <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-diff-del-ink)' }}>−{stats.del}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', padding: 2 }}>
          {([
            { v: 'inline', label: 'Inline', icon: I.write(12) },
            { v: 'sbs', label: 'Side-by-side', icon: I.split(12) },
            { v: 'rendered', label: 'Rendered', icon: I.eye(12) },
          ] as const).map((o) => (
            <button
              key={o.v}
              onClick={() => setMode(o.v)}
              style={{
                appearance: 'none', border: 'none',
                background: mode === o.v ? 'var(--cl-bg)' : 'transparent',
                color: mode === o.v ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
                padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 'calc(var(--cl-radius) - 2px)',
                cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5,
                boxShadow: mode === o.v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
              }}
            >
              {o.icon}{o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)', overflow: 'hidden' }}>
        {mode === 'inline' && <InlineDiff lines={lines} />}
        {mode === 'sbs' && <SideBySideDiff lines={lines} />}
        {mode === 'rendered' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ borderRight: '1px solid var(--cl-line)', padding: '16px 20px', overflow: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-diff-del-ink)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Before</div>
              <DiagramProse html={beforeHtml} fontSize={15} />
            </div>
            <div style={{ padding: '16px 20px', overflow: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cl-diff-add-ink)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>After</div>
              <DiagramProse html={afterHtml} fontSize={15} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InlineDiff({ lines }: { lines: DiffLine[] }) {
  return (
    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12.5, lineHeight: 1.6 }}>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            display: 'grid', gridTemplateColumns: '40px 40px 18px 1fr', alignItems: 'baseline',
            background: l.kind === 'add' ? 'var(--cl-diff-add)' : l.kind === 'del' ? 'var(--cl-diff-del)' : 'transparent',
            color: l.kind === 'add' ? 'var(--cl-diff-add-ink)' : l.kind === 'del' ? 'var(--cl-diff-del-ink)' : 'var(--cl-ink)',
          }}
        >
          <span style={lineNoStyle}>{l.oldLine ?? ''}</span>
          <span style={lineNoStyle}>{l.newLine ?? ''}</span>
          <span style={{ textAlign: 'center', userSelect: 'none', fontWeight: 600, opacity: 0.7 }}>
            {l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' '}
          </span>
          <span style={{ paddingRight: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{l.text || ' '}</span>
        </div>
      ))}
    </div>
  );
}

interface Row {
  left: DiffLine | null;
  right: DiffLine | null;
  paired?: boolean;
}

function SideBySideDiff({ lines }: { lines: DiffLine[] }) {
  const rows: Row[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.kind === 'same') {
      rows.push({ left: l, right: l });
    } else if (l.kind === 'del') {
      const next = lines[i + 1];
      if (next && next.kind === 'add') {
        rows.push({ left: l, right: next, paired: true });
        i++;
      } else {
        rows.push({ left: l, right: null });
      }
    } else {
      rows.push({ left: null, right: l });
    }
  }
  return (
    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12.5, lineHeight: 1.6, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ borderRight: '1px solid var(--cl-line)' }}>
        {rows.map((r, i) => <DiffSide key={i} side={r.left} kind="del" paired={r.paired} other={r.right} />)}
      </div>
      <div>
        {rows.map((r, i) => <DiffSide key={i} side={r.right} kind="add" paired={r.paired} other={r.left} />)}
      </div>
    </div>
  );
}

function DiffSide({ side, kind, paired, other }: { side: DiffLine | null; kind: 'add' | 'del'; paired?: boolean; other: DiffLine | null }) {
  if (!side) return <div style={{ minHeight: '1.6em', background: 'var(--cl-line-soft)', opacity: 0.4 }}>&nbsp;</div>;
  const isChange = side.kind !== 'same';
  let content: React.ReactNode = side.text;
  if (paired && other && side.kind !== 'same') {
    const wd = wordDiff(other.text, side.text);
    const parts = side.kind === 'add' ? wd.right : wd.left;
    content = parts.map((p, i) => (
      <span
        key={i}
        style={{
          background: p.k === 'a' && side.kind === 'add' ? 'rgba(63,111,63,.22)' : p.k === 'd' && side.kind === 'del' ? 'rgba(139,42,42,.22)' : 'transparent',
          borderRadius: 2,
        }}
      >
        {p.t}
      </span>
    ));
  }
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '40px 18px 1fr', alignItems: 'baseline',
        background: isChange && side.kind === 'add' ? 'var(--cl-diff-add)' : isChange && side.kind === 'del' ? 'var(--cl-diff-del)' : 'transparent',
        color: isChange && side.kind === 'add' ? 'var(--cl-diff-add-ink)' : isChange && side.kind === 'del' ? 'var(--cl-diff-del-ink)' : 'var(--cl-ink)',
      }}
    >
      <span style={lineNoStyle}>{(kind === 'del' ? side.oldLine : side.newLine) ?? ''}</span>
      <span style={{ textAlign: 'center', userSelect: 'none', fontWeight: 600, opacity: 0.7 }}>
        {side.kind === 'add' ? '+' : side.kind === 'del' ? '−' : ' '}
      </span>
      <span style={{ paddingRight: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content || ' '}</span>
    </div>
  );
}

const lineNoStyle = { textAlign: 'right' as const, padding: '0 8px', color: 'var(--cl-ink-faint)', fontSize: 11, userSelect: 'none' as const };
