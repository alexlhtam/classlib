import { notFound } from 'next/navigation';
import { guardMembership } from '@/lib/guard';
import { getNoteBySlug } from '@/lib/queries';
import { EditorView } from '@/components/EditorView';

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
    <EditorView
      slug={slug}
      noteSlug={note.slug}
      noteTitle={note.title}
      version={note.version}
      baseBody={note.body}
    />
  );
}
