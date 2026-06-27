// graphspec.ts — compile a simple JSON graph spec into Mermaid flowchart source.
//
// Authors write a ```graph code block with a dictionary of vertices + edges
// (no Mermaid knowledge needed); render.ts compiles it through here and the
// result is rendered by the same themed Mermaid pipeline as raw ```mermaid
// blocks. Because the input is plain text/JSON, it stays diffable and is
// moderated by the normal PR review gate.
//
// Example:
//   {
//     "directed": true, "weighted": true, "direction": "LR",
//     "vertices": ["s", "a", "b", {"id": "t", "label": "target"}],
//     "edges": [["s","a",4], ["s","b",2], {"from":"a","to":"t","weight":3}],
//     "highlight": ["s", "t"]
//   }

import { z } from 'zod';

const vertexSchema = z.union([
  z.string().min(1),
  z.object({ id: z.string().min(1), label: z.string().optional() }),
]);

const edgeSchema = z.union([
  // tuple form: [from, to] or [from, to, weight]
  z.tuple([z.string().min(1), z.string().min(1)]),
  z.tuple([z.string().min(1), z.string().min(1), z.union([z.number(), z.string()])]),
  z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    weight: z.union([z.number(), z.string()]).optional(),
    label: z.string().optional(),
  }),
]);

export const graphSpecSchema = z.object({
  directed: z.boolean().default(true),
  weighted: z.boolean().default(false),
  direction: z.enum(['LR', 'RL', 'TB', 'BT']).default('LR'),
  vertices: z.array(vertexSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  highlight: z.array(z.string()).default([]),
});

export type GraphSpec = z.infer<typeof graphSpecSchema>;

// Mermaid node ids must be simple tokens; map arbitrary author ids to safe ones
// while preserving the original as the visible label.
function safeId(raw: string, seen: Map<string, string>): string {
  const existing = seen.get(raw);
  if (existing) return existing;
  const base = 'n' + raw.replace(/[^a-zA-Z0-9_]/g, '_');
  let id = base;
  let i = 1;
  const used = new Set(seen.values());
  while (used.has(id)) id = `${base}_${i++}`;
  seen.set(raw, id);
  return id;
}

// Escape a label for use inside a Mermaid `id["..."]` / edge `|...|`. We strip
// the few characters that would break Mermaid's own grammar; strict
// securityLevel handles HTML/JS escaping at render time.
function label(text: string): string {
  return text.replace(/["[\]{}|<>]/g, ' ').replace(/\s+/g, ' ').trim() || ' ';
}

function edgeText(
  e: z.infer<typeof edgeSchema>,
): { from: string; to: string; text: string | null } {
  if (Array.isArray(e)) {
    return { from: e[0], to: e[1], text: e[2] != null ? String(e[2]) : null };
  }
  const text = e.label != null ? e.label : e.weight != null ? String(e.weight) : null;
  return { from: e.from, to: e.to, text };
}

export class GraphSpecError extends Error {}

// Compile validated JSON (string) into Mermaid flowchart source. Throws
// GraphSpecError on invalid JSON / shape so render.ts can show a tidy message.
export function compileGraphSpec(json: string): string {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new GraphSpecError('Invalid JSON in graph block.');
  }
  const parsed = graphSpecSchema.safeParse(raw);
  if (!parsed.success) {
    throw new GraphSpecError(parsed.error.issues[0]?.message ?? 'Invalid graph spec.');
  }
  const spec = parsed.data;
  const seen = new Map<string, string>();
  const lines: string[] = [`flowchart ${spec.direction}`];

  // Declare explicit vertices first (so isolated nodes still appear).
  for (const v of spec.vertices) {
    const rawId = typeof v === 'string' ? v : v.id;
    const text = typeof v === 'string' ? v : (v.label ?? v.id);
    lines.push(`  ${safeId(rawId, seen)}["${label(text)}"]`);
  }

  const arrow = spec.directed ? '-->' : '---';
  for (const e of spec.edges) {
    const { from, to, text } = edgeText(e);
    // Ensure endpoints exist as nodes even if not listed in `vertices`.
    const f = safeId(from, seen);
    const t = safeId(to, seen);
    if (!spec.vertices.some((v) => (typeof v === 'string' ? v : v.id) === from)) {
      lines.push(`  ${f}["${label(from)}"]`);
    }
    if (!spec.vertices.some((v) => (typeof v === 'string' ? v : v.id) === to)) {
      lines.push(`  ${t}["${label(to)}"]`);
    }
    const showWeight = spec.weighted || text != null;
    lines.push(
      showWeight && text != null
        ? `  ${f} ${arrow}|"${label(text)}"| ${t}`
        : `  ${f} ${arrow} ${t}`,
    );
  }

  // Accent-highlight selected nodes.
  for (const h of spec.highlight) {
    const id = seen.get(h);
    if (id) lines.push(`  style ${id} fill:#F1E4E0,stroke:#7A2E2E,stroke-width:2px`);
  }

  return lines.join('\n');
}
