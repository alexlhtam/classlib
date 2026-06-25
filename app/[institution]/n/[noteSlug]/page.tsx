import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { getNoteBySlug } from '@/lib/queries';
import { renderMarkdown, extractToc } from '@/lib/render';
import { DiagramProse } from '@/components/DiagramProse';
import { StatusBadge, Avatar } from '@/components/ui';
import { I } from '@/components/icons';
import { noteStatusKey } from '@/lib/status';

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ institution: string; noteSlug: string }>;
}) {
  const { institution: slug, noteSlug } = await params;
  const { institution } = await guardMembership(slug);
  const note = await getNoteBySlug(institution.id, noteSlug);
  if (!note) notFound();

  const html = renderMarkdown(note.body);
  const toc = extractToc(note.body);
  const openPRs = note._count.suggestions;
  const author = note.author?.name ?? note.author?.email ?? 'unattributed';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 200px',
        gap: 32,
        maxWidth: 980,
        margin: '0 auto',
        padding: '36px 26px',
        color: 'var(--cl-ink)',
      }}
    >
      <div className="cl-fade" style={{ minWidth: 0 }}>
        <Link
          href={`/${slug}/m/${note.module.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none', marginBottom: 14 }}
        >
          {I.back(12)} {note.module.title}
        </Link>

        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge statusKey={noteStatusKey(note.status)} />
          <span style={{ fontSize: 11.5, color: 'var(--cl-ink-faint)' }}>
            v{note.version} · last edited by{' '}
            <strong style={{ color: 'var(--cl-ink-soft)', fontWeight: 500 }}>{author}</strong>
          </span>
        </div>

        {openPRs > 0 && (
          <Link
            href={`/${slug}/pulls`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'var(--cl-accent-tint)',
              color: 'var(--cl-accent)',
              borderRadius: 'var(--cl-radius)',
              fontSize: 13,
              marginBottom: 16,
              textDecoration: 'none',
              border: '1px solid color-mix(in oklab, var(--cl-accent) 25%, transparent)',
            }}
          >
            <span style={{ display: 'flex' }}>{I.pr(14)}</span>
            <span style={{ flex: 1 }}>
              <strong style={{ fontWeight: 600 }}>
                {openPRs} open {openPRs === 1 ? 'PR' : 'PRs'}
              </strong>{' '}
              on this note
            </span>
            <span>{I.arrow(12)}</span>
          </Link>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.1, fontFamily: 'var(--cl-body-font)', flex: 1, minWidth: 0 }}>
            {note.title}
          </h1>
          <Link
            href={`/${slug}/n/${note.slug}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--cl-accent)',
              color: '#fff',
              border: '1px solid var(--cl-accent)',
              padding: '6px 14px',
              borderRadius: 'var(--cl-radius)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {I.pencil(12)} Suggest edit
          </Link>
        </div>

        <DiagramProse html={html} />

        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: '1px solid var(--cl-line-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--cl-ink-faint)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={author} size={20} />
            <span>Maintained by {author}</span>
          </div>
          <span>v{note.version}</span>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-faint)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          On this page
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {toc.map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: 'var(--cl-ink-soft)',
                lineHeight: 1.4,
                paddingLeft: (t.level - 2) * 10 + 8,
                borderLeft: i === 0 ? '2px solid var(--cl-accent)' : '2px solid transparent',
              }}
            >
              {t.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
