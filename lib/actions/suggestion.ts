'use server';

// Server actions for the PR workflow: members open suggestions; admins
// approve/merge, request changes, or reject. All gated through lib/tenancy.ts
// (so cross-tenant access and non-admin merges are impossible) and validated
// with zod. Diff stats come from the isomorphic lib/diff.ts.

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { requireMembership, requireAdmin, TenancyError } from '../tenancy';
import { computeDiffStats } from '../diff';

type Client = PrismaClient | Prisma.TransactionClient;

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function toError(e: unknown): ActionResult {
  if (e instanceof TenancyError) {
    return { ok: false, error: e.code === 'FORBIDDEN' ? 'Not allowed.' : e.code };
  }
  return { ok: false, error: 'Something went wrong.' };
}

// A note is PR_OPEN while it has any OPEN suggestion, otherwise it settles back
// to STABLE. Called after any suggestion status change.
async function recomputeNoteStatus(client: Client, noteId: string) {
  const open = await client.suggestion.count({ where: { noteId, status: 'OPEN' } });
  await client.note.update({
    where: { id: noteId },
    data: { status: open > 0 ? 'PR_OPEN' : 'STABLE' },
  });
}

const createSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(1).max(4000),
  proposedBody: z.string().min(1).max(100_000),
});

// Open a suggestion ("PR") against a note. Any member may do this. Redirects to
// the new review page on success.
export async function createSuggestion(
  slug: string,
  noteSlug: string,
  input: z.infer<typeof createSchema>,
): Promise<ActionResult> {
  let newId: string | null = null;
  try {
    const { institution, userId } = await requireMembership(slug);
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
    }
    const note = await prisma.note.findFirst({
      where: { institutionId: institution.id, slug: noteSlug },
    });
    if (!note) return { ok: false, error: 'Note not found.' };
    if (parsed.data.proposedBody.trim() === note.body.trim()) {
      return { ok: false, error: 'No changes to propose.' };
    }

    const { add, del } = computeDiffStats(note.body, parsed.data.proposedBody);
    const created = await prisma.$transaction(async (tx) => {
      const s = await tx.suggestion.create({
        data: {
          institutionId: institution.id,
          noteId: note.id,
          title: parsed.data.title,
          summary: parsed.data.summary,
          proposedBody: parsed.data.proposedBody,
          baseBody: note.body,
          status: 'OPEN',
          authorId: userId,
          additions: add,
          deletions: del,
        },
      });
      await tx.note.update({ where: { id: note.id }, data: { status: 'PR_OPEN' } });
      return s;
    });
    newId = created.id;
  } catch (e) {
    return toError(e);
  }
  revalidatePath(`/${slug}/pulls`);
  revalidatePath(`/${slug}/n/${noteSlug}`);
  redirect(`/${slug}/pulls/${newId}`);
}

// Load an OPEN suggestion scoped to the institution, asserting admin rights.
async function loadOpenForAdmin(slug: string, id: string) {
  const { institution, userId } = await requireAdmin(slug);
  const suggestion = await prisma.suggestion.findFirst({
    where: { id, institutionId: institution.id },
  });
  if (!suggestion) throw new TenancyError('NOT_FOUND');
  return { suggestion, reviewerId: userId, slug };
}

export async function approveAndMerge(slug: string, id: string): Promise<ActionResult> {
  try {
    const { suggestion, reviewerId } = await loadOpenForAdmin(slug, id);
    if (suggestion.status !== 'OPEN') return { ok: false, error: 'Already reviewed.' };

    await prisma.$transaction(async (tx) => {
      const note = await tx.note.findUniqueOrThrow({ where: { id: suggestion.noteId } });
      await tx.note.update({
        where: { id: note.id },
        data: { body: suggestion.proposedBody, version: { increment: 1 }, status: 'REVIEWED' },
      });
      await tx.suggestion.update({
        where: { id: suggestion.id },
        data: { status: 'MERGED', reviewedById: reviewerId, reviewedAt: new Date() },
      });
      await recomputeNoteStatus(tx, note.id);
    });
  } catch (e) {
    return toError(e);
  }
  revalidatePath(`/${slug}/pulls`);
  revalidatePath(`/${slug}/pulls/${id}`);
  return { ok: true };
}

async function closeSuggestion(
  slug: string,
  id: string,
  status: 'REJECTED' | 'CHANGES_REQUESTED',
): Promise<ActionResult> {
  try {
    const { suggestion, reviewerId } = await loadOpenForAdmin(slug, id);
    if (suggestion.status !== 'OPEN') return { ok: false, error: 'Already reviewed.' };
    await prisma.$transaction(async (tx) => {
      await tx.suggestion.update({
        where: { id: suggestion.id },
        data: { status, reviewedById: reviewerId, reviewedAt: new Date() },
      });
      await recomputeNoteStatus(tx, suggestion.noteId);
    });
  } catch (e) {
    return toError(e);
  }
  revalidatePath(`/${slug}/pulls`);
  revalidatePath(`/${slug}/pulls/${id}`);
  return { ok: true };
}

export async function rejectSuggestion(slug: string, id: string) {
  return closeSuggestion(slug, id, 'REJECTED');
}
export async function requestChanges(slug: string, id: string) {
  return closeSuggestion(slug, id, 'CHANGES_REQUESTED');
}
