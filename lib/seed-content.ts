// seed-content.ts — deep-copy the canonical template into one institution.
// This is the heart of the "seeded copy per institution" tenancy model: both
// createInstitution() (lib/actions/institution.ts) and prisma/seed.ts call it.

import type { Prisma, PrismaClient } from '@prisma/client';
import { CANONICAL_MODULES, CANONICAL_NOTES } from './canonical-content';

type Client = PrismaClient | Prisma.TransactionClient;

// Inserts the canonical Modules + Notes for a freshly created institution.
// `authorId` (optional) is recorded as the note author (e.g. the institution
// creator). Returns a slug -> noteId map for any follow-up seeding.
export async function seedInstitutionContent(
  client: Client,
  institutionId: string,
  authorId?: string,
): Promise<Map<string, string>> {
  const moduleIdByCode = new Map<string, string>();
  for (const m of CANONICAL_MODULES) {
    const mod = await client.module.create({
      data: {
        institutionId,
        code: m.code,
        title: m.title,
        description: m.description,
        order: m.order,
      },
    });
    moduleIdByCode.set(m.code, mod.id);
  }

  const noteIdBySlug = new Map<string, string>();
  for (const n of CANONICAL_NOTES) {
    const moduleId = moduleIdByCode.get(n.moduleCode);
    if (!moduleId) continue;
    const note = await client.note.create({
      data: {
        institutionId,
        moduleId,
        slug: n.slug,
        title: n.title,
        body: n.body,
        status: n.status,
        version: n.version,
        tags: n.tags,
        authorId: authorId ?? null,
      },
    });
    noteIdBySlug.set(n.slug, note.id);
  }
  return noteIdBySlug;
}
