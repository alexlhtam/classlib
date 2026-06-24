'use server';

// Minimal member management (v1): an admin adds an existing user to the
// institution by email and can change a member's role. Email-based invites with
// account creation are deferred. All actions are ADMIN-gated via requireAdmin.

import { z } from 'zod';
import type { Role } from '@prisma/client';
import { prisma } from '../db';
import { requireAdmin, TenancyError } from '../tenancy';

const roleSchema = z.enum(['ADMIN', 'USER']);

export interface MembershipResult {
  ok: boolean;
  error?: string;
}

function toError(e: unknown): MembershipResult {
  if (e instanceof TenancyError) {
    return {
      ok: false,
      error: e.code === 'FORBIDDEN' ? 'Admin role required.' : e.code,
    };
  }
  return { ok: false, error: 'Something went wrong.' };
}

// Add an existing user (by email) to the institution with the given role.
export async function addMember(
  slug: string,
  rawEmail: string,
  rawRole: Role = 'USER',
): Promise<MembershipResult> {
  try {
    const { institution } = await requireAdmin(slug);
    const email = z.string().email().parse(rawEmail);
    const role = roleSchema.parse(rawRole);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: false, error: 'No user with that email yet — ask them to register first.' };
    }

    await prisma.membership.upsert({
      where: {
        userId_institutionId: { userId: user.id, institutionId: institution.id },
      },
      update: { role },
      create: { userId: user.id, institutionId: institution.id, role },
    });
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

// Change an existing member's role.
export async function setMemberRole(
  slug: string,
  userId: string,
  rawRole: Role,
): Promise<MembershipResult> {
  try {
    const { institution } = await requireAdmin(slug);
    const role = roleSchema.parse(rawRole);
    await prisma.membership.update({
      where: {
        userId_institutionId: { userId, institutionId: institution.id },
      },
      data: { role },
    });
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}
