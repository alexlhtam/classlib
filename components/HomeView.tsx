'use client';

// HomeView — module grid (with client-side search filter) + recent activity.
// Ports legacy/views-home.jsx HomeView/ModuleCard/SectionHeader/ActivityFeed,
// fed by real data via props.

import { useState } from 'react';
import Link from 'next/link';
import { I } from './icons';
import type { ActivityItem } from '@/lib/queries';

export interface ModuleCardData {
  id: string;
  code: string;
  title: string;
  description: string;
  noteCount: number;
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--cl-ink-soft)',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        marginBottom: 12,
        fontVariant: 'small-caps',
        paddingBottom: 6,
        borderBottom: '1px solid var(--cl-line-soft)',
      }}
    >
      {children}
    </div>
  );
}

function ModuleCard({ slug, m }: { slug: string; m: ModuleCardData }) {
  return (
    <Link
      href={`/${slug}/m/${m.id}`}
      className="cl-card cl-fade"
      style={{
        padding: 24,
        border: '1px solid var(--cl-line)',
        borderRadius: 'var(--cl-radius)',
        background: 'var(--cl-bg)',
        cursor: 'pointer',
        transition: 'border-color .12s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        textDecoration: 'none',
        color: 'var(--cl-ink)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)', letterSpacing: '.04em' }}>
          {m.code}
        </span>
        <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)' }}>
          {m.noteCount} {m.noteCount === 1 ? 'note' : 'notes'}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--cl-ink)', letterSpacing: -0.2, fontFamily: 'var(--cl-body-font)' }}>
        {m.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--cl-ink-soft)', lineHeight: 1.5 }}>{m.description}</div>
    </Link>
  );
}

function ActivityFeed({ items }: { items: (ActivityItem & { time: string })[] }) {
  if (items.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--cl-ink-faint)' }}>No activity yet.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((it, i) => (
        <Link
          key={i}
          href={it.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0',
            borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span
            style={{
              color: it.kind === 'merge' ? '#6E40C9' : it.kind === 'pr' ? 'var(--cl-accent)' : 'var(--cl-ink-soft)',
              display: 'flex',
            }}
          >
            {it.kind === 'merge' ? I.check(14) : it.kind === 'pr' ? I.pr(14) : I.pencil(14)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--cl-ink)' }}>{it.text}</div>
            <div style={{ fontSize: 12, color: 'var(--cl-ink-soft)', marginTop: 2, fontStyle: 'italic' }}>{it.sub}</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--cl-ink-faint)', flexShrink: 0, fontFamily: 'ui-monospace, monospace' }}>
            {it.time}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function HomeView({
  slug,
  modules,
  activity,
}: {
  slug: string;
  modules: ModuleCardData[];
  activity: (ActivityItem & { time: string })[];
}) {
  const [search, setSearch] = useState('');
  const filtered = modules.filter(
    (m) =>
      !search ||
      (m.title + ' ' + m.code + ' ' + m.description).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 26px', color: 'var(--cl-ink)' }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--cl-accent)',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            marginBottom: 8,
            fontVariant: 'small-caps',
          }}
        >
          classlib · vol. ix
        </div>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.1, fontFamily: 'var(--cl-body-font)' }}>
          A library of class notes, kept by everyone.
        </h1>
        <p style={{ margin: '12px 0 0', maxWidth: 560, color: 'var(--cl-ink-soft)', fontSize: 17, lineHeight: 1.55 }}>
          Read the canonical version. Suggest a change. Maintainers review every edit before it lands — so the notes stay
          accurate, and credit lands where it should.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 24,
          background: 'var(--cl-surface)',
          border: '1px solid var(--cl-line)',
          borderRadius: 'var(--cl-radius)',
          padding: '8px 12px',
        }}
      >
        <span style={{ color: 'var(--cl-ink-faint)', display: 'flex' }}>{I.search(15)}</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules…"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--cl-ink)', fontSize: 14, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {filtered.map((m) => (
          <ModuleCard key={m.id} slug={slug} m={m} />
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <SectionHeader>Recent activity</SectionHeader>
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}
