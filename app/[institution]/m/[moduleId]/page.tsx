import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { getModuleWithNotes } from '@/lib/queries';
import { StatusBadge, Chip } from '@/components/ui';
import { I } from '@/components/icons';
import { noteStatusKey } from '@/lib/status';
import { SectionHeader } from '@/components/HomeView';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ institution: string; moduleId: string }>;
}) {
  const { institution: slug, moduleId } = await params;
  const { institution } = await guardMembership(slug);
  const m = await getModuleWithNotes(institution.id, moduleId);
  if (!m) notFound();

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 26px', color: 'var(--cl-ink)' }}>
      <Link
        href={`/${slug}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none', marginBottom: 16 }}
      >
        {I.back(12)} All modules
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--cl-ink-faint)', letterSpacing: '.06em', marginBottom: 6 }}>
          {m.code}
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: -0.4, fontFamily: 'var(--cl-body-font)' }}>{m.title}</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--cl-ink-soft)', fontSize: 14 }}>{m.description}</p>
      </div>

      <SectionHeader>
        {m.notes.length} {m.notes.length === 1 ? 'note' : 'notes'}
      </SectionHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {m.notes.map((n, i) => (
          <Link
            key={n.id}
            href={`/${slug}/n/${n.slug}`}
            className="cl-fade"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 0',
              borderBottom: i === m.notes.length - 1 ? 'none' : '1px solid var(--cl-line-soft)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span style={{ color: 'var(--cl-ink-faint)', display: 'flex' }}>{I.doc(14)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--cl-ink)' }}>{n.title}</span>
                <StatusBadge statusKey={noteStatusKey(n.status)} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)', marginTop: 3, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>v{n.version}</span>
                <span>·</span>
                <span>{n.author?.name ?? n.author?.email ?? 'unattributed'}</span>
                {n.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </div>
            <span style={{ color: 'var(--cl-ink-faint)' }}>{I.arrow(12)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
