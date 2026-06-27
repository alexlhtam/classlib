// status.ts — pure mapping from Prisma status enums to display badge keys.
// Server components call noteStatusKey()/suggestionStatusKey() to pick a key,
// then pass it to <StatusBadge>. Kept outside the 'use client' boundary so it
// can be invoked from server components.

import type { NoteStatus, SuggestionStatus } from '@prisma/client';

export type BadgeKey =
  | 'stable'
  | 'reviewed'
  | 'pr-open'
  | 'draft'
  | 'open'
  | 'merged'
  | 'rejected'
  | 'changes-requested';

export const BADGE_MAP: Record<BadgeKey, { label: string; color: string; bg: string }> = {
  stable: { label: 'Stable', color: 'var(--cl-success)', bg: 'rgba(22,163,74,.10)' },
  reviewed: { label: 'Reviewed', color: 'var(--cl-accent)', bg: 'var(--cl-accent-tint)' },
  'pr-open': { label: 'PR open', color: 'var(--cl-accent)', bg: 'var(--cl-accent-tint)' },
  draft: { label: 'Draft', color: 'var(--cl-ink-soft)', bg: 'var(--cl-chip)' },
  open: { label: 'Open', color: 'var(--cl-success)', bg: 'rgba(22,163,74,.10)' },
  merged: { label: 'Merged', color: '#6E40C9', bg: 'rgba(110,64,201,.10)' },
  rejected: { label: 'Rejected', color: 'var(--cl-danger)', bg: 'rgba(220,38,38,.10)' },
  'changes-requested': { label: 'Changes requested', color: 'var(--cl-accent)', bg: 'var(--cl-accent-tint)' },
};

const NOTE_STATUS_KEY: Record<NoteStatus, BadgeKey> = {
  STABLE: 'stable',
  REVIEWED: 'reviewed',
  PR_OPEN: 'pr-open',
  DRAFT: 'draft',
};
const SUGGESTION_STATUS_KEY: Record<SuggestionStatus, BadgeKey> = {
  OPEN: 'open',
  MERGED: 'merged',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'changes-requested',
};

export function noteStatusKey(s: NoteStatus): BadgeKey {
  return NOTE_STATUS_KEY[s];
}
export function suggestionStatusKey(s: SuggestionStatus): BadgeKey {
  return SUGGESTION_STATUS_KEY[s];
}
