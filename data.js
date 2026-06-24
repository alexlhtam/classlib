// Sample data for classlib — CS module on Algorithms
// Markdown + LaTeX content. Multiple notes per module so the browser
// has texture; one note (mergesort) has a pending PR + a merged history.

window.CLASSLIB_DATA = (function () {
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

## Running time

With a binary heap as the priority queue:

$$T(n, m) = O\\big((n + m) \\log n\\big)$$

With a Fibonacci heap, decrease-key becomes amortized $O(1)$:

$$T(n, m) = O(m + n \\log n)$$

## Why non-negative weights?

The proof of correctness rests on a *greedy invariant*: when a vertex $u$ is extracted, $d[u]$ is final. With negative edges, a later relaxation could lower $d[u]$ further, breaking the invariant. Use **Bellman-Ford** instead.
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

  const NOTES = [
    {
      id: 'mergesort', module: 'algorithms', title: 'Merge Sort',
      tags: ['sorting', 'divide-and-conquer'],
      author: 'prof.kale', updated: '3 days ago',
      version: 14, status: 'pr-open',
      body: MERGESORT_BODY,
      proposed: MERGESORT_PROPOSED,
    },
    {
      id: 'quicksort', module: 'algorithms', title: 'Quicksort',
      tags: ['sorting', 'randomized'],
      author: 'prof.kale', updated: '1 week ago',
      version: 9, status: 'stable',
      body: QUICKSORT_BODY,
    },
    {
      id: 'bigo', module: 'algorithms', title: 'Big-O, Big-Θ, Big-Ω',
      tags: ['complexity', 'foundations'],
      author: 'prof.kale', updated: '2 weeks ago',
      version: 22, status: 'stable',
      body: BIGO_BODY,
    },
    {
      id: 'dijkstra', module: 'algorithms', title: "Dijkstra's Algorithm",
      tags: ['graphs', 'shortest-paths'],
      author: 's.thatcher', updated: '4 days ago',
      version: 7, status: 'reviewed',
      body: DIJKSTRA_BODY,
    },
    {
      id: 'bfs', module: 'algorithms', title: 'Breadth-First Search',
      tags: ['graphs', 'traversal'],
      author: 's.thatcher', updated: '1 week ago',
      version: 5, status: 'stable',
      body: BFS_BODY,
    },
    {
      id: 'dfs', module: 'algorithms', title: 'Depth-First Search',
      tags: ['graphs', 'traversal'],
      author: 'm.ortiz', updated: '5 days ago',
      version: 6, status: 'stable',
      body: DFS_BODY,
    },
    {
      id: 'heap', module: 'algorithms', title: 'Binary Heaps',
      tags: ['data-structures', 'priority-queue'],
      author: 'm.ortiz', updated: '2 weeks ago',
      version: 11, status: 'stable',
      body: HEAP_BODY,
    },
  ];

  const PRS = [
    {
      id: 'pr-142', noteId: 'mergesort', title: 'Add proof sketch + overflow-safe midpoint',
      author: 'a.lin', authorFull: 'Aria Lin',
      opened: '6 hours ago',
      status: 'open',
      summary: "Adds a one-line recursion-tree justification for Θ(n log n), fixes the integer-overflow bug in the midpoint computation, and adds an 'in-place' row + 'External sorting' link.",
      additions: 4, deletions: 1,
      reviewers: 2,
      checks: 'passing',
      body: MERGESORT_PROPOSED,
      base: MERGESORT_BODY,
    },
    {
      id: 'pr-141', noteId: 'dijkstra', title: 'Clarify Fibonacci heap bound',
      author: 'j.park', authorFull: 'Jules Park',
      opened: '1 day ago',
      status: 'open',
      summary: 'Distinguishes amortized vs worst-case in the running-time table; cites CLRS §19.',
      additions: 3, deletions: 2,
      reviewers: 1,
      checks: 'passing',
    },
    {
      id: 'pr-138', noteId: 'heap', title: "Tighten build-heap derivation",
      author: 'r.okafor', authorFull: 'Rita Okafor',
      opened: '3 days ago',
      status: 'open',
      summary: "Replaces the hand-wave with the geometric-series proof of $\\sum (n/2^{h+1}) \\cdot h = O(n)$.",
      additions: 8, deletions: 2,
      reviewers: 0,
      checks: 'pending',
    },
    {
      id: 'pr-135', noteId: 'quicksort', title: 'Add introselect alternative',
      author: 'a.lin', authorFull: 'Aria Lin',
      opened: '5 days ago',
      status: 'merged',
      summary: 'Mentions introselect / median-of-three to get a deterministic O(n log n) variant.',
      additions: 12, deletions: 0,
      reviewers: 2,
      checks: 'passing',
    },
  ];

  const MODULES = [
    { id: 'algorithms', code: 'CS-2010', title: 'Algorithms & Complexity', noteCount: 7,
      contributors: 12, description: 'Sorting, graphs, dynamic programming, complexity classes.' },
    { id: 'discrete', code: 'CS-1500', title: 'Discrete Mathematics', noteCount: 14,
      contributors: 8, description: 'Logic, proofs, combinatorics, number theory.' },
    { id: 'os', code: 'CS-3300', title: 'Operating Systems', noteCount: 21,
      contributors: 19, description: 'Processes, scheduling, memory, file systems.' },
    { id: 'pl', code: 'CS-3400', title: 'Programming Languages', noteCount: 18,
      contributors: 11, description: 'Type systems, lambda calculus, compilation.' },
    { id: 'ml', code: 'CS-4710', title: 'Machine Learning', noteCount: 9,
      contributors: 23, description: 'Supervised/unsupervised learning, optimization.' },
    { id: 'crypto', code: 'CS-4500', title: 'Cryptography', noteCount: 12,
      contributors: 6, description: 'Symmetric, public-key, hash functions, protocols.' },
  ];

  return { NOTES, PRS, MODULES };
})();
