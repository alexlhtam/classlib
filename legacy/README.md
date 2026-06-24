# classlib — Knowledge Canvas

A collaborative class-notes library with GitHub-style pull-request review for
edits. Students read the canonical version of a note, suggest changes, and
maintainers review the diff before it lands.

Imported from the [Claude Design](https://claude.ai/design) exploration and
implemented in the **editorial-serif** design direction (paper-toned surfaces,
Source Serif body, small-caps section labels, ox-blood accent, square corners).

## Run

The page loads its components as `text/babel` modules, which the browser fetches
over XHR — so it must be served over HTTP (opening `index.html` via `file://`
will fail with CORS errors). Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

| File | Role |
|---|---|
| `index.html` | Entry point; loads deps + scripts, mounts one full-screen instance |
| `app.jsx` | `KnowledgeCanvas` shell — top bar, role switch, view routing |
| `theme.jsx` | Design tokens → CSS variables (editorial preset is the active one) |
| `data.js` | Sample modules, notes (Markdown + LaTeX), and pull requests |
| `render.js` | Markdown + KaTeX rendering and line/word diff |
| `ui.jsx` | Shared primitives — buttons, badges, avatars, toasts, icons |
| `views-home.jsx` | Module grid + activity feed, and the module note list |
| `views-reader.jsx` | Note reader with TOC and "Suggest edit" |
| `views-editor.jsx` | Write/Split/Read editor with live diff + submit-PR panel |
| `views-pr.jsx` | PR list and PR review (inline / side-by-side / rendered diff) |

External libraries (React, Babel, marked, KaTeX, fonts) load from CDNs, so an
internet connection is required.
