import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { getSuggestion } from '@/lib/queries';
import { renderMarkdown } from '@/lib/render';
import { StatusBadge, Avatar } from '@/components/ui';
import { I } from '@/components/icons';
import { suggestionStatusKey } from '@/lib/status';
import { DiffViewer } from '@/components/DiffViewer';
import { ReviewActions } from '@/components/ReviewActions';

export default async function PullReviewPage({
  params,
}: {
  params: Promise<{ institution: string; id: string }>;
}) {
  const { institution: slug, id } = await params;
  const { institution, role } = await guardMembership(slug);
  const s = await getSuggestion(institution.id, id);
  if (!s) notFound();

  const author = s.author?.name ?? s.author?.email ?? 'unattributed';
  const beforeHtml = renderMarkdown(s.baseBody);
  const afterHtml = renderMarkdown(s.proposedBody);
  const canReview = role === 'ADMIN' && s.status === 'OPEN';

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 26px', color: 'var(--cl-ink)' }}>
      <Link href={`/${slug}/pulls`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none', marginBottom: 14 }}>
        {I.back(12)} Pull requests
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, fontFamily: 'var(--cl-body-font)' }}>{s.title}</h1>
            <StatusBadge statusKey={suggestionStatusKey(s.status)} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--cl-ink-soft)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Avatar name={author} size={16} />
            <strong style={{ fontWeight: 500 }}>{author}</strong>
            <span>wants to merge into</span>
            <Link href={`/${slug}/n/${s.note.slug}`} style={{ fontFamily: 'ui-monospace, monospace', background: 'var(--cl-chip)', padding: '1px 6px', borderRadius: 4, textDecoration: 'none', color: 'var(--cl-ink)' }}>
              {s.note.title}
            </Link>
            <span style={{ color: 'var(--cl-diff-add-ink)', fontFamily: 'ui-monospace, monospace' }}>+{s.additions}</span>
            <span style={{ color: 'var(--cl-diff-del-ink)', fontFamily: 'ui-monospace, monospace' }}>−{s.deletions}</span>
          </div>
        </div>
        {canReview && <ReviewActions slug={slug} id={s.id} />}
      </div>

      {s.summary && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-faint)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Summary</div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--cl-ink-soft)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{s.summary}</div>
        </div>
      )}

      {s.status !== 'OPEN' && (
        <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 'var(--cl-radius)', background: 'var(--cl-surface)', border: '1px solid var(--cl-line)', fontSize: 13, color: 'var(--cl-ink-soft)' }}>
          {s.status === 'MERGED' ? 'Merged' : s.status === 'REJECTED' ? 'Rejected' : 'Changes requested'}
          {s.reviewedBy && ` by ${s.reviewedBy.name ?? s.reviewedBy.email}`}.
        </div>
      )}

      <DiffViewer baseBody={s.baseBody} proposedBody={s.proposedBody} beforeHtml={beforeHtml} afterHtml={afterHtml} />
    </div>
  );
}
