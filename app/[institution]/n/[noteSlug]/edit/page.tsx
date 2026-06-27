import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { getNoteBySlug } from '@/lib/queries';
import { ComingSoon } from '@/components/ComingSoon';

// Placeholder until Phase 4 (the Write/Split/Read editor + createSuggestion
// server action that opens a PR). Membership-gated like every tenant route.
export default async function EditPage({
  params,
}: {
  params: Promise<{ institution: string; noteSlug: string }>;
}) {
  const { institution: slug, noteSlug } = await params;
  const { institution } = await guardMembership(slug);
  const note = await getNoteBySlug(institution.id, noteSlug);
  if (!note) notFound();

  return (
    <ComingSoon
      title={`Suggest an edit to ${note.title}`}
      subtitle="Editor"
      body="The Markdown editor with live diff and the “open a pull request” flow land in Phase 4."
      backHref={`/${slug}/n/${note.slug}`}
      backLabel={`Back to ${note.title}`}
    />
  );
}
