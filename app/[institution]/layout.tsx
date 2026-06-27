import { auth } from '@/lib/auth';
import { guardMembership } from '@/lib/guard';
import { getOpenSuggestionCount } from '@/lib/queries';
import { TopBar } from '@/components/TopBar';

export default async function InstitutionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ institution: string }>;
}) {
  const { institution: slug } = await params;
  const { institution, role } = await guardMembership(slug);
  const [session, openPrCount] = await Promise.all([
    auth(),
    getOpenSuggestionCount(institution.id),
  ]);
  const userName = session?.user?.name ?? session?.user?.email ?? 'You';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cl-bg)',
        color: 'var(--cl-ink)',
      }}
    >
      <TopBar
        slug={slug}
        institutionName={institution.name}
        role={role}
        userName={userName}
        openPrCount={openPrCount}
      />
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}
