// queries.ts — tenant-scoped reads for the institution UI.
// Every function takes an institutionId (obtained via requireMembership(slug) in
// the calling server component) and filters by it, so nothing crosses tenants.

import { prisma } from './db';

export function getModulesWithCounts(institutionId: string) {
  return prisma.module.findMany({
    where: { institutionId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { notes: true } } },
  });
}

export function getModuleWithNotes(institutionId: string, moduleId: string) {
  return prisma.module.findFirst({
    where: { id: moduleId, institutionId },
    include: {
      notes: {
        orderBy: { title: 'asc' },
        include: { author: { select: { name: true, email: true } } },
      },
    },
  });
}

export function getNoteBySlug(institutionId: string, slug: string) {
  return prisma.note.findFirst({
    where: { institutionId, slug },
    include: {
      module: { select: { id: true, title: true, code: true } },
      author: { select: { name: true, email: true } },
      _count: { select: { suggestions: { where: { status: 'OPEN' } } } },
    },
  });
}

export function getOpenSuggestionCount(institutionId: string) {
  return prisma.suggestion.count({ where: { institutionId, status: 'OPEN' } });
}

export function getSuggestions(institutionId: string) {
  return prisma.suggestion.findMany({
    where: { institutionId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      note: { select: { slug: true, title: true } },
      author: { select: { name: true, email: true } },
    },
  });
}

export function getSuggestion(institutionId: string, id: string) {
  return prisma.suggestion.findFirst({
    where: { id, institutionId },
    include: {
      note: { select: { slug: true, title: true, version: true } },
      author: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
  });
}

export function getMembers(institutionId: string) {
  return prisma.membership.findMany({
    where: { institutionId },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export function getUserInstitutions(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { institution: true },
  });
}

export type ActivityKind = 'pr' | 'merge' | 'edit';
export interface ActivityItem {
  kind: ActivityKind;
  text: string;
  sub: string;
  at: Date;
  href: string;
}

function authorName(a: { name: string | null; email: string } | null): string {
  return a?.name ?? a?.email ?? 'Someone';
}

// Unified recent-activity feed: suggestions (opened/merged) + updated notes,
// newest first. Replaces the legacy hardcoded ActivityFeed array.
export async function getRecentActivity(
  slug: string,
  institutionId: string,
  limit = 6,
): Promise<ActivityItem[]> {
  const [suggestions, notes] = await Promise.all([
    prisma.suggestion.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        note: { select: { slug: true, title: true } },
        author: { select: { name: true, email: true } },
      },
    }),
    prisma.note.findMany({
      where: { institutionId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { author: { select: { name: true, email: true } } },
    }),
  ]);

  const items: ActivityItem[] = [];
  for (const s of suggestions) {
    const merged = s.status === 'MERGED';
    items.push({
      kind: merged ? 'merge' : 'pr',
      text: `${authorName(s.author)} ${merged ? 'merged' : 'opened'} a PR on ${s.note.title}`,
      sub: `"${s.title}"`,
      at: merged && s.reviewedAt ? s.reviewedAt : s.createdAt,
      href: `/${slug}/pulls`,
    });
  }
  for (const n of notes) {
    items.push({
      kind: 'edit',
      text: `${authorName(n.author)} updated ${n.title}`,
      sub: `v${n.version}`,
      at: n.updatedAt,
      href: `/${slug}/n/${n.slug}`,
    });
  }
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

// "3 days ago"-style relative time for the UI.
export function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(d / 365)}y`;
}
