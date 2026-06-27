import Link from 'next/link';
import { guardMembership } from '@/lib/guard';
import { getSuggestions } from '@/lib/queries';
import { StatusBadge } from '@/components/ui';
import { I } from '@/components/icons';
import { suggestionStatusKey } from '@/lib/status';

const FILTERS = [
  { key: 'open', label: 'Open', match: (st: string) => st === 'OPEN' },
  { key: 'merged', label: 'Merged', match: (st: string) => st === 'MERGED' },
  { key: 'all', label: 'All', match: () => true },
] as const;

export default async function PullsPage({
  params,
  searchParams,
}: {
  params: Promise<{ institution: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { institution: slug } = await params;
  const { filter: rawFilter } = await searchParams;
  const { institution } = await guardMembership(slug);
  const all = await getSuggestions(institution.id);
  const openCount = all.filter((s) => s.status === 'OPEN').length;

  const active = FILTERS.find((f) => f.key === rawFilter) ?? FILTERS[0];
  const suggestions = all.filter((s) => active.match(s.status));

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 26px', color: 'var(--cl-ink)' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: -0.4, fontFamily: 'var(--cl-body-font)' }}>
          Pull requests
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--cl-ink-soft)', fontSize: 14 }}>
          Suggested edits reviewed before they merge. {openCount} open.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--cl-chip)', borderRadius: 'var(--cl-radius)', width: 'fit-content', marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/${slug}/pulls?filter=${f.key}`}
            style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 'calc(var(--cl-radius) - 2px)',
              textDecoration: 'none', textTransform: 'capitalize',
              background: active.key === f.key ? 'var(--cl-bg)' : 'transparent',
              color: active.key === f.key ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
              boxShadow: active.key === f.key ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}
          >
            {f.label}
            {f.key === 'open' && <span style={{ color: 'var(--cl-ink-faint)', marginLeft: 5 }}>{openCount}</span>}
          </Link>
        ))}
      </div>

      {suggestions.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--cl-ink-faint)' }}>No {active.key === 'all' ? '' : active.key} suggestions.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {suggestions.map((s, i) => (
            <Link
              key={s.id}
              href={`/${slug}/pulls/${s.id}`}
              className="cl-fade"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 0',
                borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ color: 'var(--cl-accent)', display: 'flex' }}>{I.pr(15)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--cl-ink)' }}>{s.title}</span>
                  <StatusBadge statusKey={suggestionStatusKey(s.status)} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)', marginTop: 3, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>on {s.note.title}</span>
                  <span>·</span>
                  <span>{s.author?.name ?? s.author?.email ?? 'unattributed'}</span>
                  <span>·</span>
                  <span style={{ color: 'var(--cl-success)', fontFamily: 'ui-monospace, monospace' }}>+{s.additions}</span>
                  <span style={{ color: 'var(--cl-danger)', fontFamily: 'ui-monospace, monospace' }}>−{s.deletions}</span>
                </div>
              </div>
              <span style={{ color: 'var(--cl-ink-faint)' }}>{I.arrow(12)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
