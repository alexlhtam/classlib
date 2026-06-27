// canonical-content.ts — the typed seed template for a new institution.
//
// Ported from legacy/data.js. On institution creation, createInstitution()
// deep-copies this template (the "seeded copy" tenancy model) so each
// institution gets its own independent copy of the canonical content.
//
// NOTE: note bodies are Markdown + LaTeX. Because these are JS template
// literals, a LaTeX `\Theta` must be written `\\Theta` here — preserve the
// double backslashes (same rule as the legacy data.js).

import type { NoteStatus } from '@prisma/client';

export interface CanonicalNote {
  slug: string;
  moduleCode: string;
  title: string;
  tags: string[];
  status: NoteStatus;
  version: number;
  body: string;
}

export interface CanonicalModule {
  code: string;
  title: string;
  description: string;
  order: number;
}

export interface CanonicalSuggestion {
  noteSlug: string;
  title: string;
  summary: string;
  additions: number;
  deletions: number;
  proposedBody: string;
}

const MERGESORT_BODY = `# Merge Sort

Merge sort is a classic **divide-and-conquer** sorting algorithm. Given an array of $n$ elements, it recursively splits the array in half, sorts each half, and merges the two sorted halves back into one sorted array.

## Recurrence

The running time satisfies the recurrence

$$T(n) = 2\\,T(n/2) + \\Theta(n)$$

By the Master Theorem (Case 2, where $a = 2$, $b = 2$, $f(n) = \\Theta(n)$, and $n^{\\log_b a} = n$):

$$T(n) = \\Theta(n \\log n)$$

This bound is tight for both worst- and average-case inputs — merge sort is *not* adaptive in its standard form.

## Pseudocode

\`\`\`
mergeSort(A, lo, hi):
  if hi - lo <= 1: return
  mid = (lo + hi) / 2
  mergeSort(A, lo, mid)
  mergeSort(A, mid, hi)
  merge(A, lo, mid, hi)
\`\`\`

## Comparison with Quicksort

| Property | Merge sort | Quicksort |
|---|---|---|
| Worst-case time | $\\Theta(n \\log n)$ | $\\Theta(n^2)$ |
| Expected time | $\\Theta(n \\log n)$ | $\\Theta(n \\log n)$ |
| Space | $\\Theta(n)$ | $\\Theta(\\log n)$ |
| Stable | Yes | No (typical impl.) |

> Merge sort's predictable bound makes it the algorithm of choice when worst-case guarantees matter — for instance, in external sorting where pages of data spill to disk.

See also: [Quicksort](#), [Heapsort](#), [Master Theorem](#).
`;

const MERGESORT_PROPOSED = `# Merge Sort

Merge sort is a classic **divide-and-conquer** sorting algorithm. Given an array of $n$ elements, it recursively splits the array in half, sorts each half, and merges the two sorted halves back into one sorted array.

## Recurrence

The running time satisfies the recurrence

$$T(n) = 2\\,T(n/2) + \\Theta(n)$$

By the Master Theorem (Case 2, where $a = 2$, $b = 2$, $f(n) = \\Theta(n)$, and $n^{\\log_b a} = n$):

$$T(n) = \\Theta(n \\log n)$$

This bound is tight for both worst- and average-case inputs — merge sort is *not* adaptive in its standard form. A short proof sketch: the recursion tree has depth $\\log_2 n$, and each level performs $\\Theta(n)$ comparisons during the merge step, giving $\\Theta(n \\log n)$ total.

## Pseudocode

\`\`\`
mergeSort(A, lo, hi):
  if hi - lo <= 1: return
  mid = lo + (hi - lo) / 2  # avoids integer overflow
  mergeSort(A, lo, mid)
  mergeSort(A, mid, hi)
  merge(A, lo, mid, hi)
\`\`\`

## Comparison with Quicksort

| Property | Merge sort | Quicksort |
|---|---|---|
| Worst-case time | $\\Theta(n \\log n)$ | $\\Theta(n^2)$ |
| Expected time | $\\Theta(n \\log n)$ | $\\Theta(n \\log n)$ |
| Space | $\\Theta(n)$ | $\\Theta(\\log n)$ |
| Stable | Yes | No (typical impl.) |
| In-place | No | Yes |

> Merge sort's predictable bound makes it the algorithm of choice when worst-case guarantees matter — for instance, in external sorting where pages of data spill to disk.

See also: [Quicksort](#), [Heapsort](#), [Master Theorem](#), [External sorting](#).
`;

const QUICKSORT_BODY = `# Quicksort

Quicksort sorts an array by **partitioning** it around a pivot element: elements less than the pivot move left, greater move right, and the algorithm recurses on each side.

## Expected running time

For a uniformly random pivot, the expected number of comparisons is

$$\\mathbb{E}[C(n)] = 2(n+1)H_n - 4n = \\Theta(n \\log n)$$

where $H_n = \\sum_{k=1}^{n} 1/k$ is the $n$-th harmonic number.

The worst case — pivot is always the smallest or largest — gives $\\Theta(n^2)$.

## Partition (Lomuto)

\`\`\`
partition(A, lo, hi):
  pivot = A[hi]
  i = lo - 1
  for j = lo to hi - 1:
    if A[j] <= pivot:
      i = i + 1
      swap A[i], A[j]
  swap A[i+1], A[hi]
  return i + 1
\`\`\`

In practice, **randomized pivot** or **median-of-three** mitigates worst-case behavior on adversarial inputs.
`;

const BIGO_BODY = `# Big-O, Big-Θ, Big-Ω

Asymptotic notation describes how a function grows as its input size $n \\to \\infty$.

## Definitions

For functions $f, g : \\mathbb{N} \\to \\mathbb{R}_{\\geq 0}$:

- $f(n) = O(g(n))$ iff $\\exists\\, c > 0,\\ n_0 \\geq 0$ such that $f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$.
- $f(n) = \\Omega(g(n))$ iff $\\exists\\, c > 0,\\ n_0 \\geq 0$ such that $f(n) \\geq c \\cdot g(n)$ for all $n \\geq n_0$.
- $f(n) = \\Theta(g(n))$ iff $f(n) = O(g(n))$ **and** $f(n) = \\Omega(g(n))$.

## Common growth rates, ordered

$$1 \\prec \\log n \\prec \\sqrt{n} \\prec n \\prec n \\log n \\prec n^2 \\prec n^3 \\prec 2^n \\prec n!$$

> A common abuse of notation: writing $f(n) = O(g(n))$ when we really mean $f(n) \\in O(g(n))$. The "$=$" here is asymmetric — you cannot read it left-to-right.

## Master Theorem

For recurrences of the form $T(n) = a\\,T(n/b) + f(n)$ with $a \\geq 1$, $b > 1$:

| Case | Condition | Result |
|---|---|---|
| 1 | $f(n) = O(n^{\\log_b a - \\epsilon})$ | $T(n) = \\Theta(n^{\\log_b a})$ |
| 2 | $f(n) = \\Theta(n^{\\log_b a})$ | $T(n) = \\Theta(n^{\\log_b a} \\log n)$ |
| 3 | $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ + regularity | $T(n) = \\Theta(f(n))$ |
`;

const DIJKSTRA_BODY = `# Dijkstra's Algorithm

Single-source shortest paths on a graph $G = (V, E)$ with **non-negative** edge weights $w : E \\to \\mathbb{R}_{\\geq 0}$.

## Idea

Maintain a tentative distance $d[v]$ for every vertex, initialized to $\\infty$ except $d[s] = 0$. Repeatedly extract the unvisited vertex $u$ with the smallest $d[u]$ and **relax** every outgoing edge:

$$d[v] \\leftarrow \\min\\big(d[v],\\ d[u] + w(u, v)\\big)$$

## Example graph

A small weighted, directed graph from source $s$ to target $t$. classlib turns
this edge/weight dictionary into a diagram — no diagram syntax required:

\`\`\`graph
{
  "directed": true,
  "weighted": true,
  "direction": "LR",
  "vertices": ["s", "a", "b", "c", "t"],
  "edges": [
    ["s", "a", 4], ["s", "b", 2], ["b", "a", 1],
    ["a", "c", 5], ["b", "c", 8], ["c", "t", 3], ["a", "t", 11]
  ],
  "highlight": ["s", "t"]
}
\`\`\`

## Running time

With a binary heap as the priority queue:

$$T(n, m) = O\\big((n + m) \\log n\\big)$$

With a Fibonacci heap, decrease-key becomes amortized $O(1)$:

$$T(n, m) = O(m + n \\log n)$$

## Why non-negative weights?

The proof of correctness rests on a *greedy invariant*: when a vertex $u$ is extracted, $d[u]$ is final. With negative edges, a later relaxation could lower $d[u]$ further, breaking the invariant. Use **Bellman-Ford** instead.

## Aside: a vertex's lifecycle

For finite-state machines and flowcharts, you can also write [Mermaid](https://mermaid.js.org) directly. Each vertex moves through these states:

\`\`\`mermaid
stateDiagram-v2
  [*] --> Unvisited
  Unvisited --> InQueue: discovered
  InQueue --> Settled: extract-min
  Settled --> [*]
\`\`\`
`;

const BFS_BODY = `# Breadth-First Search

BFS explores a graph level-by-level from a source $s$, using a FIFO queue.

## Properties

- Visits every reachable vertex exactly once: $O(n + m)$ time, $O(n)$ space.
- Computes **shortest paths in unweighted graphs** — equivalently, Dijkstra's where every edge has weight $1$.
- Yields a *BFS tree* rooted at $s$ where tree edges connect a vertex to its parent.

\`\`\`
bfs(G, s):
  d[s] = 0; mark s
  Q = queue([s])
  while Q not empty:
    u = Q.pop()
    for v in G.neighbors(u):
      if v not marked:
        mark v
        d[v] = d[u] + 1
        Q.push(v)
\`\`\`

> BFS and DFS differ only in the data structure used to track the frontier — queue vs. stack.
`;

const DFS_BODY = `# Depth-First Search

DFS explores as far along each branch as possible before backtracking. Implemented recursively or with an explicit stack.

## Classification of edges

In a DFS of a directed graph, every edge $(u, v)$ falls into one of four classes by comparing discovery/finish timestamps:

- **Tree** edge: $v$ was unvisited when $(u, v)$ was traversed.
- **Back** edge: $v$ is an ancestor of $u$ (indicates a cycle).
- **Forward** edge: $v$ is a descendant of $u$ via a non-tree path.
- **Cross** edge: $v$ is in a different subtree, already finished.

A directed graph is acyclic iff its DFS produces no back edges.

## Applications

- Topological sort (reverse finish-time order on a DAG)
- Strongly connected components (Kosaraju, Tarjan)
- Cycle detection
- Bridges and articulation points
`;

const HEAP_BODY = `# Binary Heaps

A binary heap is an array-backed almost-complete binary tree satisfying the heap property: in a *min-heap*, every parent is $\\leq$ its children.

## Index arithmetic (1-indexed)

For a node at index $i$:
- parent: $\\lfloor i/2 \\rfloor$
- left child: $2i$
- right child: $2i + 1$

## Operations

| Operation | Time |
|---|---|
| insert | $O(\\log n)$ |
| extract-min | $O(\\log n)$ |
| peek-min | $O(1)$ |
| build-heap (Floyd) | $O(n)$ |
| decrease-key | $O(\\log n)$ |

The build-heap bound is sharper than the naive $O(n \\log n)$ — the work concentrates near the leaves. Formally:

$$\\sum_{h=0}^{\\log n} \\frac{n}{2^{h+1}} \\cdot O(h) = O(n)$$
`;

export const CANONICAL_MODULES: CanonicalModule[] = [
  {
    code: 'CS-2010',
    title: 'Algorithms & Complexity',
    description: 'Sorting, graphs, dynamic programming, complexity classes.',
    order: 0,
  },
  {
    code: 'CS-1500',
    title: 'Discrete Mathematics',
    description: 'Logic, proofs, combinatorics, number theory.',
    order: 1,
  },
  {
    code: 'CS-3300',
    title: 'Operating Systems',
    description: 'Processes, scheduling, memory, file systems.',
    order: 2,
  },
  {
    code: 'CS-3400',
    title: 'Programming Languages',
    description: 'Type systems, lambda calculus, compilation.',
    order: 3,
  },
  {
    code: 'CS-4710',
    title: 'Machine Learning',
    description: 'Supervised/unsupervised learning, optimization.',
    order: 4,
  },
  {
    code: 'CS-4500',
    title: 'Cryptography',
    description: 'Symmetric, public-key, hash functions, protocols.',
    order: 5,
  },
];

export const CANONICAL_NOTES: CanonicalNote[] = [
  {
    slug: 'mergesort',
    moduleCode: 'CS-2010',
    title: 'Merge Sort',
    tags: ['sorting', 'divide-and-conquer'],
    status: 'PR_OPEN',
    version: 14,
    body: MERGESORT_BODY,
  },
  {
    slug: 'quicksort',
    moduleCode: 'CS-2010',
    title: 'Quicksort',
    tags: ['sorting', 'randomized'],
    status: 'STABLE',
    version: 9,
    body: QUICKSORT_BODY,
  },
  {
    slug: 'bigo',
    moduleCode: 'CS-2010',
    title: 'Big-O, Big-Θ, Big-Ω',
    tags: ['complexity', 'foundations'],
    status: 'STABLE',
    version: 22,
    body: BIGO_BODY,
  },
  {
    slug: 'dijkstra',
    moduleCode: 'CS-2010',
    title: "Dijkstra's Algorithm",
    tags: ['graphs', 'shortest-paths'],
    status: 'REVIEWED',
    version: 7,
    body: DIJKSTRA_BODY,
  },
  {
    slug: 'bfs',
    moduleCode: 'CS-2010',
    title: 'Breadth-First Search',
    tags: ['graphs', 'traversal'],
    status: 'STABLE',
    version: 5,
    body: BFS_BODY,
  },
  {
    slug: 'dfs',
    moduleCode: 'CS-2010',
    title: 'Depth-First Search',
    tags: ['graphs', 'traversal'],
    status: 'STABLE',
    version: 6,
    body: DFS_BODY,
  },
  {
    slug: 'heap',
    moduleCode: 'CS-2010',
    title: 'Binary Heaps',
    tags: ['data-structures', 'priority-queue'],
    status: 'STABLE',
    version: 11,
    body: HEAP_BODY,
  },
];

// Demo suggestions ("PRs") for local dev / first-run texture. Only the
// mergesort one carries a full proposed body (the open proof-sketch PR);
// createInstitution() does NOT seed these — prisma/seed.ts does, for `demo`.
export const DEMO_SUGGESTIONS: CanonicalSuggestion[] = [
  {
    noteSlug: 'mergesort',
    title: 'Add proof sketch + overflow-safe midpoint',
    summary:
      "Adds a one-line recursion-tree justification for Θ(n log n), fixes the integer-overflow bug in the midpoint computation, and adds an 'in-place' row + 'External sorting' link.",
    additions: 4,
    deletions: 1,
    proposedBody: MERGESORT_PROPOSED,
  },
];

export const CANONICAL_CONTENT = {
  modules: CANONICAL_MODULES,
  notes: CANONICAL_NOTES,
  demoSuggestions: DEMO_SUGGESTIONS,
};
