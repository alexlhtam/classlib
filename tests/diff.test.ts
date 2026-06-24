import { describe, it, expect } from 'vitest';
import { lineDiff, computeDiffStats } from '../lib/diff';

describe('lineDiff / computeDiffStats', () => {
  it('reports no changes for identical text', () => {
    expect(computeDiffStats('a\nb\nc', 'a\nb\nc')).toEqual({ add: 0, del: 0 });
  });

  it('counts a pure addition', () => {
    expect(computeDiffStats('a\nb', 'a\nb\nc')).toEqual({ add: 1, del: 0 });
  });

  it('counts a pure deletion', () => {
    expect(computeDiffStats('a\nb\nc', 'a\nc')).toEqual({ add: 0, del: 1 });
  });

  it('counts a modified line as one add + one del', () => {
    expect(computeDiffStats('a\nb\nc', 'a\nB\nc')).toEqual({ add: 1, del: 1 });
  });

  it('preserves line numbers on unchanged lines', () => {
    const lines = lineDiff('a\nb', 'a\nb');
    expect(lines.every((l) => l.kind === 'same')).toBe(true);
    expect(lines.map((l) => l.newLine)).toEqual([1, 2]);
  });
});
