import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { prisma } from '@/lib/db';
import { ComingSoon } from '@/components/ComingSoon';

// Placeholder until Phase 4 (PR review: side-by-side / inline / rendered diff +
// admin approve / merge / reject). For now it confirms the suggestion exists in
// this tenant and points back to the list.
export default async function PullReviewPage({
  params,
}: {
  params: Promise<{ institution: string; id: string }>;
}) {
  const { institution: slug, id } = await params;
  const { institution } = await guardMembership(slug);
  const suggestion = await prisma.suggestion.findFirst({
    where: { id, institutionId: institution.id },
    include: { note: { select: { title: true } } },
  });
  if (!suggestion) notFound();

  return (
    <ComingSoon
      title={suggestion.title}
      subtitle={`Suggested edit on ${suggestion.note.title}`}
      body="The diff viewer and approve / merge / reject actions land in Phase 4."
      backHref={`/${slug}/pulls`}
      backLabel="Back to pull requests"
    >
      <Link href={`/${slug}/pulls`} style={{ color: 'var(--cl-accent)' }}>
        ← all pull requests
      </Link>
    </ComingSoon>
  );
}
