// tenancy.ts — the server-side isolation + role gate.
// EVERY tenant-scoped read/write must resolve the institution from the URL slug
// through requireMembership(slug); this is what makes cross-tenant access
// impossible and role gating non-bypassable from the UI.

import type { Institution, Role } from '@prisma/client';
import { prisma } from './db';
import { auth } from './auth';

export type TenancyErrorCode = 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN';

export class TenancyError extends Error {
  constructor(
    public code: TenancyErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'TenancyError';
  }
}

export interface MembershipContext {
  institution: Institution;
  role: Role;
  userId: string;
}

export async function resolveInstitution(
  slug: string,
): Promise<Institution | null> {
  return prisma.institution.findUnique({ where: { slug } });
}

// Resolves the institution for `slug` and asserts the current user is a member.
// Throws TenancyError otherwise. Returns the institution + the caller's role.
export async function requireMembership(
  slug: string,
): Promise<MembershipContext> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new TenancyError('UNAUTHENTICATED');

  const institution = await resolveInstitution(slug);
  if (!institution) throw new TenancyError('NOT_FOUND');

  const membership = await prisma.membership.findUnique({
    where: {
      userId_institutionId: { userId, institutionId: institution.id },
    },
  });
  if (!membership) throw new TenancyError('FORBIDDEN');

  return { institution, role: membership.role, userId };
}

// Same as requireMembership but additionally requires the ADMIN role — used to
// gate approve/merge/reject and member management.
export async function requireAdmin(slug: string): Promise<MembershipContext> {
  const ctx = await requireMembership(slug);
  if (ctx.role !== 'ADMIN') {
    throw new TenancyError('FORBIDDEN', 'Admin role required');
  }
  return ctx;
}
