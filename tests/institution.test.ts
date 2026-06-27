import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => {
  const m: any = {
    institution: { findUnique: vi.fn(), create: vi.fn() },
    membership: { upsert: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
  };
  m.$transaction = (fn: any) => fn(m);
  return m;
});
const authMock = vi.hoisted(() => vi.fn());
const seedMock = vi.hoisted(() => vi.fn());
const gate = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

vi.mock('../lib/db', () => ({ prisma: db }));
vi.mock('../lib/auth', () => ({ auth: authMock }));
vi.mock('../lib/seed-content', () => ({ seedInstitutionContent: seedMock }));
vi.mock('../lib/tenancy', () => {
  class TenancyError extends Error {
    constructor(public code: string, msg?: string) {
      super(msg ?? code);
    }
  }
  return { TenancyError, requireAdmin: gate.requireAdmin, requireMembership: vi.fn() };
});

import { createInstitution } from '../lib/actions/institution';
import { addMember } from '../lib/actions/membership';

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction = (fn: any) => fn(db);
});

describe('createInstitution', () => {
  it('creates the institution with the creator as ADMIN and seeds content', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    db.institution.findUnique.mockResolvedValue(null);
    db.institution.create.mockResolvedValue({ id: 'inst1', slug: 'demo2' });

    const res = await createInstitution({ name: 'Demo Two', slug: 'demo2' });

    expect(res).toEqual({ ok: true, slug: 'demo2' });
    const data = db.institution.create.mock.calls[0][0].data;
    expect(data.memberships.create).toEqual([{ userId: 'u1', role: 'ADMIN' }]);
    expect(seedMock).toHaveBeenCalledWith(db, 'inst1', 'u1');
  });

  it('rejects a taken slug', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    db.institution.findUnique.mockResolvedValue({ id: 'x' });
    const res = await createInstitution({ name: 'Demo', slug: 'demo' });
    expect(res.ok).toBe(false);
  });

  it('requires sign-in', async () => {
    authMock.mockResolvedValue(null);
    const res = await createInstitution({ name: 'Demo', slug: 'demo3' });
    expect(res.ok).toBe(false);
  });
});

describe('addMember', () => {
  it('is blocked for non-admins', async () => {
    const { TenancyError } = await import('../lib/tenancy');
    gate.requireAdmin.mockRejectedValue(new TenancyError('FORBIDDEN'));
    const res = await addMember('demo', 'x@y.z', 'USER');
    expect(res.ok).toBe(false);
  });

  it('adds an existing user as a member', async () => {
    gate.requireAdmin.mockResolvedValue({ institution: { id: 'inst1' }, role: 'ADMIN', userId: 'admin1' });
    db.user.findUnique.mockResolvedValue({ id: 'u2' });
    db.membership.upsert.mockResolvedValue({});
    const res = await addMember('demo', 'new@school.edu', 'USER');
    expect(res.ok).toBe(true);
    expect(db.membership.upsert).toHaveBeenCalled();
  });
});
