import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared mock prisma; $transaction runs its callback with the same object.
const db = vi.hoisted(() => {
  const m: any = {
    note: { findFirst: vi.fn(), update: vi.fn(), findUniqueOrThrow: vi.fn() },
    suggestion: { create: vi.fn(), update: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
  };
  m.$transaction = (fn: any) => fn(m);
  return m;
});
const gate = vi.hoisted(() => ({ requireMembership: vi.fn(), requireAdmin: vi.fn() }));

vi.mock('../lib/db', () => ({ prisma: db }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error('REDIRECT:' + url);
  },
}));
// Fully mock tenancy (don't load the real auth/next-auth chain). The actions
// use `instanceof TenancyError`, so the class here is the one they see.
vi.mock('../lib/tenancy', () => {
  class TenancyError extends Error {
    constructor(public code: string, msg?: string) {
      super(msg ?? code);
      this.name = 'TenancyError';
    }
  }
  return { TenancyError, requireMembership: gate.requireMembership, requireAdmin: gate.requireAdmin };
});

import { createSuggestion, approveAndMerge, rejectSuggestion } from '../lib/actions/suggestion';

const INST = { id: 'inst1', slug: 'demo', name: 'Demo' };

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction = (fn: any) => fn(db);
});

describe('createSuggestion', () => {
  it('computes diff stats, opens the suggestion, flips note to PR_OPEN, redirects', async () => {
    gate.requireMembership.mockResolvedValue({ institution: INST, role: 'USER', userId: 'u1' });
    db.note.findFirst.mockResolvedValue({ id: 'note1', body: 'line a\nline b' });
    db.suggestion.create.mockResolvedValue({ id: 'sug1' });
    db.note.update.mockResolvedValue({});

    await expect(
      createSuggestion('demo', 'mergesort', {
        title: 'Improve it',
        summary: 'because',
        proposedBody: 'line a\nline B\nline c',
      }),
    ).rejects.toThrow('REDIRECT:/demo/pulls/sug1');

    const data = db.suggestion.create.mock.calls[0][0].data;
    expect(data.status).toBe('OPEN');
    expect(data.baseBody).toBe('line a\nline b');
    expect(data.additions).toBeGreaterThan(0);
    expect(db.note.update).toHaveBeenCalledWith({ where: { id: 'note1' }, data: { status: 'PR_OPEN' } });
  });

  it('rejects when nothing changed', async () => {
    gate.requireMembership.mockResolvedValue({ institution: INST, role: 'USER', userId: 'u1' });
    db.note.findFirst.mockResolvedValue({ id: 'note1', body: 'same' });
    const res = await createSuggestion('demo', 'mergesort', { title: 'x y', summary: 's', proposedBody: 'same' });
    expect(res).toEqual({ ok: false, error: 'No changes to propose.' });
  });
});

describe('approveAndMerge', () => {
  it('writes the proposed body, bumps version, marks MERGED, resettles note status', async () => {
    gate.requireAdmin.mockResolvedValue({ institution: INST, role: 'ADMIN', userId: 'admin1' });
    db.suggestion.findFirst.mockResolvedValue({ id: 'sug1', noteId: 'note1', status: 'OPEN', proposedBody: 'NEW BODY' });
    db.note.findUniqueOrThrow.mockResolvedValue({ id: 'note1', body: 'OLD', version: 4 });
    db.suggestion.count.mockResolvedValue(0); // no other open suggestions

    const res = await approveAndMerge('demo', 'sug1');
    expect(res.ok).toBe(true);
    expect(db.note.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'note1' }, data: expect.objectContaining({ body: 'NEW BODY' }) }),
    );
    expect(db.suggestion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'MERGED', reviewedById: 'admin1' }) }),
    );
    // recomputeNoteStatus: 0 open -> STABLE
    expect(db.note.update).toHaveBeenCalledWith({ where: { id: 'note1' }, data: { status: 'STABLE' } });
  });

  it('is blocked for non-admins (tenancy gate)', async () => {
    const { TenancyError } = await import('../lib/tenancy');
    gate.requireAdmin.mockRejectedValue(new TenancyError('FORBIDDEN'));
    const res = await rejectSuggestion('demo', 'sug1');
    expect(res.ok).toBe(false);
  });
});
