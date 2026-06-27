'use client';

// Admin-only review controls for an OPEN suggestion. Calls the server actions
// (which re-check requireAdmin server-side — these buttons are a convenience,
// not the security boundary).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveAndMerge, requestChanges, rejectSuggestion } from '@/lib/actions/suggestion';
import { Btn } from './ui';
import { I } from './icons';

type Kind = 'merge' | 'changes' | 'reject';

export function ReviewActions({ slug, id }: { slug: string; id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(kind: Kind, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(kind);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) setError(res.error ?? 'Action failed.');
      else router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="danger" size="sm" disabled={pending} icon={I.x(12)} onClick={() => run('reject', () => rejectSuggestion(slug, id))}>
          {busy === 'reject' ? '…' : 'Reject'}
        </Btn>
        <Btn variant="secondary" size="sm" disabled={pending} onClick={() => run('changes', () => requestChanges(slug, id))}>
          {busy === 'changes' ? '…' : 'Request changes'}
        </Btn>
        <Btn variant="success" size="sm" disabled={pending} icon={I.check(12)} onClick={() => run('merge', () => approveAndMerge(slug, id))}>
          {busy === 'merge' ? '…' : 'Approve & merge'}
        </Btn>
      </div>
      {error && <span style={{ color: 'var(--cl-danger)', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
