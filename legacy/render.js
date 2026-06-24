// render.js — Markdown + LaTeX rendering, diff computation.
// Exposes window.cl_render(markdown) -> HTML string, and
// window.cl_diff(oldText, newText) -> { lines: [...], inline: [...] }

(function () {
  // ── Markdown → HTML via marked + KaTeX
  // We hook KaTeX into marked by intercepting math delimiters before parse.
  // marked's default renderer handles tables/code/headings/lists.

  const KATEX_OPTS = {
    throwOnError: false,
    strict: false,
    output: 'html',
    trust: true,
  };

  function renderMath(src, displayMode) {
    try { return katex.renderToString(src, { ...KATEX_OPTS, displayMode }); }
    catch (e) { return `<span style="color:#c00">${e.message}</span>`; }
  }

  // Replace $$...$$ and $...$ with placeholders so marked doesn't munge LaTeX,
  // then swap in KaTeX HTML on the rendered output. Works because the placeholders
  // round-trip cleanly through marked.
  function preMath(md) {
    const blocks = [];
    let i = 0;
    md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_, body) => {
      blocks.push({ display: true, body });
      return `\u0000MATH${i++}\u0000`;
    });
    md = md.replace(/(^|[^\\])\$([^\n$]+?)\$/g, (m, pre, body) => {
      blocks.push({ display: false, body });
      return `${pre}\u0000MATH${i++}\u0000`;
    });
    return { md, blocks };
  }
  function postMath(html, blocks) {
    return html.replace(/\u0000MATH(\d+)\u0000/g, (_, n) => {
      const b = blocks[Number(n)];
      return renderMath(b.body, b.display);
    });
  }

  function render(md) {
    if (!md) return '';
    const { md: stripped, blocks } = preMath(md);
    const html = marked.parse(stripped, { breaks: false, gfm: true });
    return postMath(html, blocks);
  }

  // ── Line-level diff (Myers-ish, simple LCS)
  // Returns array of { kind: 'same'|'add'|'del', text: string, oldLine, newLine }.
  function lineDiff(a, b) {
    const A = a.split('\n');
    const B = b.split('\n');
    const m = A.length, n = B.length;
    // LCS table
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0, j = 0, oi = 1, ni = 1;
    while (i < m && j < n) {
      if (A[i] === B[j]) { out.push({ kind: 'same', text: A[i], oldLine: oi++, newLine: ni++ }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ kind: 'del', text: A[i], oldLine: oi++, newLine: null }); i++; }
      else { out.push({ kind: 'add', text: B[j], oldLine: null, newLine: ni++ }); j++; }
    }
    while (i < m) { out.push({ kind: 'del', text: A[i++], oldLine: oi++, newLine: null }); }
    while (j < n) { out.push({ kind: 'add', text: B[j++], oldLine: null, newLine: ni++ }); }
    return out;
  }

  // Word-level diff inside a paired add/del — for inline highlighting.
  function wordDiff(a, b) {
    const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
    const m = A.length, n = B.length;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = m - 1; i >= 0; i--)
      for (let j = n - 1; j >= 0; j--)
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const left = [], right = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (A[i] === B[j]) { left.push({ k: 's', t: A[i] }); right.push({ k: 's', t: B[j] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { left.push({ k: 'd', t: A[i] }); i++; }
      else { right.push({ k: 'a', t: B[j] }); j++; }
    }
    while (i < m) left.push({ k: 'd', t: A[i++] });
    while (j < n) right.push({ k: 'a', t: B[j++] });
    return { left, right };
  }

  function diffStats(lines) {
    let add = 0, del = 0;
    for (const l of lines) { if (l.kind === 'add') add++; else if (l.kind === 'del') del++; }
    return { add, del };
  }

  Object.assign(window, { cl_render: render, cl_diff: lineDiff, cl_wordDiff: wordDiff, cl_diffStats: diffStats });
})();
