'use client';

// TopBar — institution-scoped header. Ports legacy app.jsx TopBar, but the
// student/maintainer role *switch* becomes a static badge of the member's real
// role, and sign-out goes through Auth.js.

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Role } from '@prisma/client';
import { Avatar } from './ui';
import { I } from './icons';

export function TopBar({
  slug,
  institutionName,
  role,
  userName,
  openPrCount,
}: {
  slug: string;
  institutionName: string;
  role: Role;
  userName: string;
  openPrCount: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 18px',
        borderBottom: '1px solid var(--cl-line)',
        background: 'var(--cl-bg)',
        flexShrink: 0,
      }}
    >
      <Link
        href={`/${slug}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 0,
            background: 'var(--cl-ink)',
            color: 'var(--cl-bg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: '"Source Serif 4", serif',
            letterSpacing: -0.5,
          }}
        >
          cl
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--cl-ink)',
            fontFamily: 'var(--cl-body-font)',
            letterSpacing: -0.2,
          }}
        >
          classlib
        </span>
      </Link>

      <span style={{ fontSize: 12, color: 'var(--cl-ink-faint)', marginLeft: 4 }}>/</span>
      <span style={{ fontSize: 12.5, color: 'var(--cl-ink-soft)' }}>{institutionName}</span>

      <div style={{ flex: 1 }} />

      <Link
        href={`/${slug}/pulls`}
        style={{
          border: '1px solid var(--cl-line)',
          background: 'transparent',
          color: 'var(--cl-ink)',
          padding: '5px 12px',
          borderRadius: 'var(--cl-radius)',
          fontSize: 12.5,
          fontWeight: 500,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {I.pr(13)} Pull requests
        {openPrCount > 0 && (
          <span
            style={{
              background: 'var(--cl-accent)',
              color: '#fff',
              fontSize: 10,
              padding: '0 5px',
              borderRadius: 8,
              fontFamily: 'ui-monospace, monospace',
              minWidth: 14,
              textAlign: 'center',
            }}
          >
            {openPrCount}
          </span>
        )}
      </Link>

      {role === 'ADMIN' && (
        <Link
          href={`/${slug}/settings`}
          style={{
            fontSize: 12.5, color: 'var(--cl-ink-soft)', textDecoration: 'none',
            border: '1px solid var(--cl-line)', padding: '5px 12px', borderRadius: 'var(--cl-radius)',
          }}
        >
          Settings
        </Link>
      )}

      <span
        title={`You are ${role === 'ADMIN' ? 'a maintainer' : 'a member'} of this classlib`}
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'lowercase',
          fontVariant: 'small-caps',
          letterSpacing: '.04em',
          color: role === 'ADMIN' ? 'var(--cl-accent)' : 'var(--cl-ink-soft)',
          borderBottom: `1.5px solid ${role === 'ADMIN' ? 'var(--cl-accent)' : 'var(--cl-line)'}`,
          paddingBottom: 1,
        }}
      >
        {role === 'ADMIN' ? 'maintainer' : 'member'}
      </span>

      <Avatar name={userName} size={26} />

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        title="Sign out"
        style={{
          appearance: 'none',
          border: '1px solid var(--cl-line)',
          background: 'transparent',
          color: 'var(--cl-ink-soft)',
          padding: '5px 10px',
          borderRadius: 'var(--cl-radius)',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
