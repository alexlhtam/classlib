import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getUserInstitutions } from '@/lib/queries';

// Landing: for a signed-in user, list the classlibs (institutions) they belong
// to as entry points. Signed-out users get sign-in / register CTAs. The full
// create-institution + picker flow lands in Phase 5.
export default async function LandingPage() {
  const session = await auth();
  const memberships = session?.user?.id
    ? await getUserInstitutions(session.user.id)
    : [];

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
      <p
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 12,
          color: 'var(--cl-ink-faint)',
          marginBottom: 8,
          fontVariant: 'small-caps',
        }}
      >
        Knowledge Canvas
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 500, margin: '0 0 16px', fontFamily: 'var(--cl-body-font)', letterSpacing: -0.6 }}>
        classlib
      </h1>
      <p style={{ fontSize: 18, color: 'var(--cl-ink-soft)', lineHeight: 1.6, maxWidth: 560 }}>
        A collaborative class-notes library with GitHub-style pull-request review
        for edits. Read the canonical version of a note, suggest changes, and let
        maintainers review the diff before it merges.
      </p>

      {session?.user ? (
        <section style={{ marginTop: 40 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--cl-ink-soft)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              fontVariant: 'small-caps',
              paddingBottom: 6,
              borderBottom: '1px solid var(--cl-line-soft)',
              marginBottom: 12,
            }}
          >
            Your classlibs
          </div>

          {memberships.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--cl-ink-faint)' }}>
              You’re not a member of any classlib yet. (Creating and joining
              institutions lands in Phase 5.)
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {memberships.map((m) => (
                <Link
                  key={m.id}
                  href={`/${m.institution.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '14px 16px',
                    border: '1px solid var(--cl-line)',
                    borderRadius: 'var(--cl-radius)',
                    background: 'var(--cl-bg)',
                    textDecoration: 'none',
                    color: 'var(--cl-ink)',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--cl-body-font)' }}>
                    {m.institution.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontVariant: 'small-caps',
                      letterSpacing: '.04em',
                      color: m.role === 'ADMIN' ? 'var(--cl-accent)' : 'var(--cl-ink-faint)',
                    }}
                  >
                    {m.role === 'ADMIN' ? 'maintainer' : 'member'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div style={{ marginTop: 36, display: 'flex', gap: 12 }}>
          <Link
            href="/login"
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--cl-radius)',
              background: 'var(--cl-accent)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--cl-radius)',
              border: '1px solid var(--cl-line)',
              color: 'var(--cl-ink)',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create an account
          </Link>
        </div>
      )}
    </main>
  );
}
