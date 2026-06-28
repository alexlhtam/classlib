'use server';

import { z } from 'zod';
import { prisma } from '../db';
import { auth } from '../auth';

const slugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.');

const createInstitutionSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slugSchema,
});

export interface CreateInstitutionResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

export async function createInstitution(
  input: z.infer<typeof createInstitutionSchema>,
): Promise<CreateInstitutionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = createInstitutionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { name, slug } = parsed.data;

  const existing = await prisma.institution.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: 'That slug is already taken.' };

  await prisma.institution.create({
    data: {
      name,
      slug,
      memberships: { create: [{ userId, role: 'ADMIN' }] },
    },
  });

  return { ok: true, slug };
}
