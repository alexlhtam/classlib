import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth + db modules that tenancy.ts depends on, so we can exercise the
// isolation/role gate without a real session or database.
const auth = vi.fn();
const institutionFindUnique = vi.fn();
const membershipFindUnique = vi.fn();

vi.mock('../lib/auth', () => ({ auth: () => auth() }));
vi.mock('../lib/db', () => ({
  prisma: {
    institution: { findUnique: (...a: unknown[]) => institutionFindUnique(...a) },
    membership: { findUnique: (...a: unknown[]) => membershipFindUnique(...a) },
  },
}));

import { requireMembership, requireAdmin, TenancyError } from '../lib/tenancy';

const INST = { id: 'inst_a', slug: 'a', name: 'A' };

beforeEach(() => {
  auth.mockReset();
  institutionFindUnique.mockReset();
  membershipFindUnique.mockReset();
});

describe('requireMembership', () => {
  it('rejects an unauthenticated caller', async () => {
    auth.mockResolvedValue(null);
    await expect(requireMembership('a')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('rejects an unknown institution', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } });
    institutionFindUnique.mockResolvedValue(null);
    await expect(requireMembership('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('denies a non-member (cross-tenant isolation)', async () => {
    auth.mockResolvedValue({ user: { id: 'outsider' } });
    institutionFindUnique.mockResolvedValue(INST);
    membershipFindUnique.mockResolvedValue(null);
    await expect(requireMembership('a')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('returns the role for a member', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } });
    institutionFindUnique.mockResolvedValue(INST);
    membershipFindUnique.mockResolvedValue({ role: 'USER' });
    const ctx = await requireMembership('a');
    expect(ctx).toMatchObject({ role: 'USER', userId: 'u1' });
    expect(ctx.institution.id).toBe('inst_a');
  });
});

describe('requireAdmin', () => {
  it('rejects a USER member', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } });
    institutionFindUnique.mockResolvedValue(INST);
    membershipFindUnique.mockResolvedValue({ role: 'USER' });
    await expect(requireAdmin('a')).rejects.toBeInstanceOf(TenancyError);
  });

  it('allows an ADMIN member', async () => {
    auth.mockResolvedValue({ user: { id: 'admin1' } });
    institutionFindUnique.mockResolvedValue(INST);
    membershipFindUnique.mockResolvedValue({ role: 'ADMIN' });
    const ctx = await requireAdmin('a');
    expect(ctx.role).toBe('ADMIN');
  });
});
