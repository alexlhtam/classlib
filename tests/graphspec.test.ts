import { describe, it, expect } from 'vitest';
import { compileGraphSpec, GraphSpecError } from '../lib/graphspec';

describe('compileGraphSpec', () => {
  it('compiles a weighted directed graph to mermaid flowchart', () => {
    const out = compileGraphSpec(
      JSON.stringify({
        directed: true,
        weighted: true,
        direction: 'LR',
        vertices: ['s', 't'],
        edges: [['s', 't', 4]],
      }),
    );
    expect(out).toContain('flowchart LR');
    expect(out).toContain('ns["s"]');
    expect(out).toContain('nt["t"]');
    expect(out).toContain('ns -->|"4"| nt');
  });

  it('uses --- for undirected edges and omits weight when unweighted', () => {
    const out = compileGraphSpec(
      JSON.stringify({ directed: false, vertices: ['a', 'b'], edges: [['a', 'b']] }),
    );
    expect(out).toContain('na --- nb');
    expect(out).not.toContain('-->');
  });

  it('honors object edges with explicit labels and node labels', () => {
    const out = compileGraphSpec(
      JSON.stringify({
        vertices: [{ id: 'x', label: 'Start' }],
        edges: [{ from: 'x', to: 'y', label: 'go' }],
      }),
    );
    expect(out).toContain('nx["Start"]');
    expect(out).toContain('|"go"|');
  });

  it('highlights nodes that exist', () => {
    const out = compileGraphSpec(
      JSON.stringify({ vertices: ['s'], edges: [], highlight: ['s'] }),
    );
    expect(out).toContain('style ns fill:');
  });

  it('strips characters that would break mermaid grammar in labels', () => {
    const out = compileGraphSpec(
      JSON.stringify({ vertices: [{ id: 'a', label: 'a"];click' }], edges: [] }),
    );
    expect(out).not.toContain('"];click');
  });

  it('throws GraphSpecError on invalid JSON', () => {
    expect(() => compileGraphSpec('{not json')).toThrow(GraphSpecError);
  });
});
