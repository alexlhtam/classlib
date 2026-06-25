import Link from 'next/link';
import { guardMembership } from '@/lib/guard';
import { getSuggestions } from '@/lib/queries';
import { StatusBadge } from '@/components/ui';
import { I } from '@/components/icons';
import { suggestionStatusKey } from '@/lib/status';
import { SectionHeader } from '@/components/HomeView';

export default async function PullsPage({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const { institution: slug } = await params;
  const { institution } = await guardMembership(slug);
  const suggestions = await getSuggestions(institution.id);
  const openCount = suggestions.filter((s) => s.status === 'OPEN').length;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 26px', color: 'var(--cl-ink)' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: -0.4, fontFamily: 'var(--cl-body-font)' }}>
          Pull requests
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--cl-ink-soft)', fontSize: 14 }}>
          Suggested edits awaiting review. {openCount} open.
        </p>
      </div>

      <SectionHeader>{suggestions.length} total</SectionHeader>

      {suggestions.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--cl-ink-faint)' }}>No suggestions yet.</div>
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
