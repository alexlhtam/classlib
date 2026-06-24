// review/ai.ts — STUB seam for future AI-assisted suggestion review.
//
// When built, this will call the Anthropic Claude API (current model, confirmed
// via the claude-api reference at build time) to pre-review a suggestion and
// populate Suggestion.aiReview. For now it returns null so the field stays
// empty and nothing in the review flow depends on it.

export interface AiReview {
  verdict: 'approve' | 'reject' | 'changes_requested' | 'unsure';
  rationale: string;
  model: string;
  reviewedAt: string;
}

export interface AiReviewInput {
  noteTitle: string;
  baseBody: string;
  proposedBody: string;
  summary: string;
}

// Returns null until the AI reviewer is implemented.
export async function reviewSuggestion(
  _input: AiReviewInput,
): Promise<AiReview | null> {
  return null;
}
