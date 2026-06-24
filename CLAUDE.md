# CLAUDE.md

Guidance for working in this repo.

> **Migration in progress.** The repo is being rebuilt from the browser-only
> prototype into a deployable Next.js + TypeScript + Prisma/Postgres multi-tenant
> app per `docs/plan.md`. The original prototype now lives in `legacy/` (the
> notes below describe it and remain the visual reference). The new app lives at
> the repo root (`app/`, `lib/`, `prisma/`). See `README.md` for the current
> stack and local-dev steps. The sections below document the **legacy prototype**.

## What this is

**classlib — Knowledge Canvas**: a collaborative class-notes library with
GitHub-style pull-request review for edits. Students read the canonical version
of a note, suggest changes (which open a "PR"), and maintainers review the diff
before it merges.

It is a **single-page client-only prototype**. There is no build step, no
bundler, and no backend — `index.html` loads React, Babel-standalone, `marked`,
and KaTeX from CDNs and transpiles the `.jsx` files in the browser. All data is
hardcoded in `data.js`.

The app was imported from a Claude Design exploration that had three aesthetic
directions; this repo ships only the **editorial-serif** direction.

## Running

Must be served over HTTP — the `text/babel` scripts are fetched via XHR, so
opening `index.html` from `file://` fails with CORS errors.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Needs internet in the browser (React/Babel/marked/KaTeX/fonts come from CDNs).

## Layout

- `index.html` — entry point; loads deps + scripts in order, mounts a single
  `<ToastHost><KnowledgeCanvas direction="editorial"/></ToastHost>` into `#root`.
- `app.jsx` — `KnowledgeCanvas` shell: top bar, role switch (student/maintainer),
  and view routing with a back-stack. Locked to the editorial preset.
- `theme.jsx` — `window.CL_THEME_PRESETS` design tokens → CSS variables via
  `window.cl_themeStyle`, plus `window.cl_densityScale`.
- `data.js` — `window.CLASSLIB_DATA` = `{ NOTES, PRS, MODULES }`. Note bodies are
  Markdown + LaTeX template literals.
- `render.js` — `window.cl_render` (Markdown+KaTeX → HTML) and `cl_diff` /
  `cl_wordDiff` / `cl_diffStats` (LCS line/word diff).
- `ui.jsx` — shared primitives (`Btn`, `StatusBadge`, `Avatar`, `Chip`,
  `ToastHost`/`useToast`, icon set `I`), all exported onto `window`.
- `views-home.jsx` — `HomeView` (module grid + activity) and `ModuleView`.
- `views-reader.jsx` — `ReaderView` (note + TOC + "Suggest edit").
- `views-editor.jsx` — `EditorView` (Write/Split/Read, live diff, submit-PR panel).
- `views-pr.jsx` — `PRListView` and `PRReviewView` (inline / side-by-side /
  rendered diff).

## Conventions

- **No modules.** Every file is a classic script. Components and helpers are
  attached to `window` via `Object.assign(window, {...})` at the bottom of each
  file, and referenced as bare globals elsewhere. New shared symbols must be
  exported the same way.
- **Script order matters** in `index.html`: `data.js` and `render.js` (plain JS)
  load before the `text/babel` files; `app.jsx` loads last, then the inline mount.
- **Styling is inline-style + CSS variables.** Read tokens as `var(--cl-ink)`,
  `var(--cl-accent)`, `var(--cl-line)`, `var(--cl-radius)`, etc. Don't hardcode
  colors — add/extend tokens in `theme.jsx` instead.
- Components still branch on `theme.name === 'editorial'` / `theme.serif` in
  places; since only the editorial preset ships, those branches are effectively
  the active path, but leave them intact to keep components self-describing.
- **LaTeX in `data.js`**: bodies are JS template literals, so a LaTeX `\Theta`
  must be written `\\Theta` in source. Preserve the double backslashes.

## Verifying changes

There's no browser in the dev sandbox. To sanity-check JSX changes without one,
transpile with Babel-standalone and server-render with real React + marked +
katex (this catches syntax + runtime errors and confirms LaTeX/markdown output).
Otherwise, serve and click through in a browser.
