// diff.ts — isomorphic LCS line/word diff. Ported verbatim in logic from
// legacy/render.js (cl_diff / cl_wordDiff / cl_diffStats), typed for TS.
// Runs on both server (seed, server actions) and client (editor live preview).

export type LineKind = 'same' | 'add' | 'del';

export interface DiffLine {
  kind: LineKind;
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

export interface DiffStats {
  add: number;
  del: number;
}

export interface WordToken {
  k: 's' | 'a' | 'd';
  t: string;
}

export interface WordDiff {
  left: WordToken[];
  right: WordToken[];
}

// Line-level diff (simple LCS). Returns add/del/same lines with line numbers.
export function lineDiff(a: string, b: string): DiffLine[] {
  const A = a.split('\n');
  const B = b.split('\n');
  const m = A.length;
  const n = B.length;
  const dp: Int32Array[] = Array.from(
    { length: m + 1 },
    () => new Int32Array(n + 1),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        A[i] === B[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oi = 1;
  let ni = 1;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      out.push({ kind: 'same', text: A[i], oldLine: oi++, newLine: ni++ });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'del', text: A[i], oldLine: oi++, newLine: null });
      i++;
    } else {
      out.push({ kind: 'add', text: B[j], oldLine: null, newLine: ni++ });
      j++;
    }
  }
  while (i < m) out.push({ kind: 'del', text: A[i++], oldLine: oi++, newLine: null });
  while (j < n) out.push({ kind: 'add', text: B[j++], oldLine: null, newLine: ni++ });
  return out;
}

// Word-level diff inside a paired add/del — for inline highlighting.
export function wordDiff(a: string, b: string): WordDiff {
  const A = a.split(/(\s+)/);
  const B = b.split(/(\s+)/);
  const m = A.length;
  const n = B.length;
  const dp: Int32Array[] = Array.from(
    { length: m + 1 },
    () => new Int32Array(n + 1),
  );
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] =
        A[i] === B[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const left: WordToken[] = [];
  const right: WordToken[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      left.push({ k: 's', t: A[i] });
      right.push({ k: 's', t: B[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      left.push({ k: 'd', t: A[i] });
      i++;
    } else {
      right.push({ k: 'a', t: B[j] });
      j++;
    }
  }
  while (i < m) left.push({ k: 'd', t: A[i++] });
  while (j < n) right.push({ k: 'a', t: B[j++] });
  return { left, right };
}

export function diffStats(lines: DiffLine[]): DiffStats {
  let add = 0;
  let del = 0;
  for (const l of lines) {
    if (l.kind === 'add') add++;
    else if (l.kind === 'del') del++;
  }
  return { add, del };
}

// Convenience: additions/deletions between two full texts.
export function computeDiffStats(base: string, proposed: string): DiffStats {
  return diffStats(lineDiff(base, proposed));
}
