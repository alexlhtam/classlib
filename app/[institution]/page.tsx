import { guardMembership } from '@/lib/guard';
import { getModulesWithCounts, getRecentActivity, timeAgo } from '@/lib/queries';
import { HomeView } from '@/components/HomeView';

export default async function InstitutionHome({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const { institution: slug } = await params;
  const { institution } = await guardMembership(slug);

  const [modules, activity] = await Promise.all([
    getModulesWithCounts(institution.id),
    getRecentActivity(slug, institution.id),
  ]);

  return (
    <HomeView
      slug={slug}
      modules={modules.map((m) => ({
        id: m.id,
        code: m.code,
        title: m.title,
        description: m.description,
        noteCount: m._count.notes,
      }))}
      activity={activity.map((a) => ({ ...a, time: timeAgo(a.at) }))}
    />
  );
}
