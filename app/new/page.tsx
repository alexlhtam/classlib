import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NewInstitutionForm } from '@/components/NewInstitutionForm';

// Create a new institution. Requires sign-in (the action also re-checks).
export default async function NewInstitutionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '72px 24px' }}>
      <Link href="/" style={{ fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none' }}>← Back</Link>
      <h1 style={{ fontSize: 30, fontWeight: 500, margin: '16px 0 8px', fontFamily: 'var(--cl-body-font)', letterSpacing: -0.4 }}>
        Create a classlib
      </h1>
      <p style={{ fontSize: 15, color: 'var(--cl-ink-soft)', lineHeight: 1.55, marginBottom: 28 }}>
        Spin up an independent class-notes library for your institution.
      </p>
      <NewInstitutionForm />
    </main>
  );
}
