import { guardAdmin } from '@/lib/guard';
import { getMembers } from '@/lib/queries';
import { MembersManager } from '@/components/MembersManager';

// Institution settings — ADMIN only (guardAdmin → notFound for non-admins).
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const { institution: slug } = await params;
  const { institution, userId } = await guardAdmin(slug);
  const members = await getMembers(institution.id);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 26px', color: 'var(--cl-ink)' }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: -0.4, fontFamily: 'var(--cl-body-font)' }}>
        Settings
      </h1>
      <p style={{ margin: '8px 0 28px', color: 'var(--cl-ink-soft)', fontSize: 14 }}>
        Members of <strong>{institution.name}</strong>. Maintainers can review and merge suggestions.
      </p>
      <MembersManager
        slug={slug}
        currentUserId={userId}
        members={members.map((m) => ({ userId: m.userId, role: m.role, name: m.user.name, email: m.user.email }))}
      />
    </div>
  );
}
