# Plan: classlib → deployable multi-tenant app

## Context

`classlib` is currently a browser-only React prototype (in-browser Babel, CDN
scripts, hardcoded `data.js`, `window`-global components, single editorial-serif
theme). The goal is a **fully deployable application**: real auth with two roles
(admin approves suggestions, user creates them), per-institution tenancy where
each institution is its own classlib, and persistence — a streamlined
Google-Classroom-style notes library with PR-style review.

**Decisions (from the user):**
- **Stack:** Next.js (App Router) full-stack, **TypeScript**.
- **Auth:** Both Google OAuth **and** email+password, via Auth.js (NextAuth v5).
- **Tenancy data model:** **Seeded copy per institution** — on institution
  creation, deep-copy the canonical content template; each institution is then
  independent (no live link back to canonical). Shared Postgres, every
  tenant-scoped row carries `institutionId`.
- **Tenant routing:** path-based slug, `classlib.app/<institution>/...`.
- **Hosting/DB:** Vercel + hosted Postgres (Neon or Supabase), Prisma.

**Future (design seams now, build later):** AI-assisted suggestion review (the
"AI-approval" idea) — wire a `Suggestion.aiReview` field + a `lib/review/`
seam so a reviewer (the **Anthropic Claude API**, current model) can pre-review
suggestions; promote-to-canonical upstream flow; subdomain tenancy (no schema
change needed).

## Approach

Rebuild in the same repo as a Next.js app. Move the current prototype to
`legacy/` (keeps the editorial-serif visual reference and git history intact);
the Next app lives at repo root. Port the existing UI logic rather than
redesign — the editorial look is already approved.

### Repo shape
```
classlib/
  app/
    layout.tsx                      # root layout, editorial CSS vars
    globals.css                     # :root --cl-* tokens, .cl-prose, keyframes (from index.html <style>)
    page.tsx                        # landing: institution picker / create / sign-in
    (auth)/login, (auth)/register   # credentials + Google button
    [institution]/
      layout.tsx                    # resolve slug -> institution, require membership, TopBar
      page.tsx                      # HomeView (module grid + activity)
      m/[moduleId]/page.tsx         # ModuleView
      n/[noteSlug]/page.tsx         # ReaderView (server-rendered prose)
      n/[noteSlug]/edit/page.tsx    # EditorView (client)
      pulls/page.tsx                # PRListView (suggestions)
      pulls/[id]/page.tsx           # PRReviewView (admin approve/merge)
    api/auth/[...nextauth]/route.ts # Auth.js handler
  lib/
    db.ts          # Prisma client singleton
    auth.ts        # NextAuth config (Google + Credentials/bcrypt), session helpers
    tenancy.ts     # resolveInstitution(slug), requireMembership(slug) -> {institution, role}
    render.ts      # server markdown+KaTeX -> sanitized HTML (ports render.js cl_render)
    diff.ts        # cl_diff / cl_wordDiff / cl_diffStats (ports render.js, isomorphic)
    canonical-content.ts # typed seed template (ported from data.js MODULES/NOTES)
    actions/       # server actions: createSuggestion, approve/reject/requestChanges,
                   #   createInstitution(seeds content), inviteMember/setRole
    review/ai.ts   # STUB seam for future AI review (returns null now)
  components/      # ported, "use client" where interactive:
    ui.tsx (Btn, StatusBadge, Avatar, Chip, Toast, icons I)
    Prose.tsx, HomeView.tsx, ModuleView.tsx, ReaderView.tsx,
    EditorView.tsx, SubmitPanel.tsx, PRListView.tsx, PRReviewView.tsx, diff views
  prisma/
    schema.prisma
    seed.ts        # demo institution + admin + seeded content + one open suggestion
  legacy/          # the current static prototype, for reference
  .env.example, README.md, CLAUDE.md
```

### Data model (Prisma / Postgres)
- **User**: id, email (unique), name, image, passwordHash? (null for OAuth-only).
  Plus Auth.js `Account` (OAuth links). JWT sessions, so no Session table needed.
- **Institution**: id, slug (unique), name, createdAt.
- **Membership**: userId, institutionId, role `ADMIN|USER`, unique(userId,institutionId).
  A user can belong to many institutions; role is per-institution.
- **Module**: id, institutionId, code, title, description, order.
- **Note**: id, institutionId, moduleId, slug, title, body, status
  `STABLE|REVIEWED|PR_OPEN|DRAFT`, version, authorId?, tags string[], updatedAt.
  unique(institutionId, slug).
- **Suggestion** (the "PR"): id, institutionId, noteId, title, summary,
  proposedBody, baseBody (snapshot), status `OPEN|MERGED|REJECTED|CHANGES_REQUESTED`,
  authorId, additions, deletions, reviewedById?, reviewedAt?, createdAt,
  **aiReview Json?** (future hook).
- **SuggestionAsset** (proof/source upload): id, suggestionId, name, url, mime, size.
  Uploads via **Vercel Blob** (optional in v1; metadata-only fallback if deferred).

Everything tenant-scoped is filtered by `institutionId` from the URL slug; all
reads/writes go through `requireMembership(slug)` so cross-tenant access is
impossible. Mutations live in **server actions**, role-gated server-side
(approve/merge/reject require `role === 'ADMIN'`; create-suggestion requires any
member).

### Canonical content & seeding
`lib/canonical-content.ts` holds the typed template ported from the existing
`data.js` (the algorithms module + its Markdown/LaTeX notes — keep the `\\Theta`
double-backslash escaping). `createInstitution` runs a transaction that inserts
Modules + Notes copied from this template (the "seeded copy" model). `prisma/seed.ts`
builds a `demo` institution with an admin user, the seeded content, and one open
suggestion (the mergesort proof-sketch PR) for local dev.

### Porting the UI (reuse, don't redesign)
- `index.html` `<style>` → `app/globals.css`; bake the **editorial** tokens from
  `theme.jsx` `CL_THEME_PRESETS.editorial` into `:root` CSS vars (drop runtime
  theme switching and the other two presets).
- `ui.jsx` → `components/ui.tsx`: same components/inline styles, but ES exports
  instead of `Object.assign(window, …)`; icons `I` exported as a const.
- `views-*.jsx` → `components/*.tsx`, `"use client"`, receiving data via props
  (from server components) instead of `window.CLASSLIB_DATA`; callbacks become
  `next/navigation` routing + server actions.
- `render.js` → `lib/render.ts` (server-side `marked` + `katex`, **sanitized**)
  and `lib/diff.ts` (isomorphic). Note rendering happens on the server; the
  editor's live preview re-renders via a server action or a slim client renderer.

### Security (must-haves)
- **Markdown sanitization:** user-submitted Markdown→HTML must be sanitized
  (sanitize-html / isomorphic-dompurify) with a KaTeX-aware allowlist before
  `dangerouslySetInnerHTML`. Use KaTeX `trust:false` server-side.
- **Tenant isolation + role gating enforced in server code**, never UI-only.
- Validate all action inputs with **zod**; hash passwords with **bcryptjs**.

## Implementation phases
1. **Scaffold:** create Next.js TS app at root, move prototype to `legacy/`,
   add Prisma + Postgres, `globals.css` (editorial tokens + prose), root layout.
2. **Data + auth:** schema + first migration, `canonical-content.ts`, seed,
   Auth.js (Google + credentials), login/register, `tenancy.ts` helpers.
3. **Read UI:** port `ui.tsx`, `render.ts`, `diff.ts`, Prose; institution home,
   module, reader routes (server-fetch → client views).
4. **Write flows:** editor + `createSuggestion`; pulls list + review; admin
   approve/merge/reject actions + note status transitions; activity feed from DB.
5. **Institution mgmt:** create-institution (seeds content, creator=ADMIN),
   landing/picker, basic member invite + role change.
6. **Deploy:** `.env.example`, Neon/Supabase DB, Vercel project + env vars
   (`DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `AUTH_URL`,
   optional `BLOB_READ_WRITE_TOKEN`), `prisma migrate deploy`, prod auth
   callbacks, smoke test.

## Verification
- **Build/types:** `next build` + `tsc --noEmit` clean.
- **Local run:** Postgres (Neon dev branch or local docker), `prisma migrate dev`,
  `prisma db seed`, `npm run dev`. Click-through: register + Google sign-in →
  create institution (content seeded) → browse modules/notes (Markdown+LaTeX
  render) → "Suggest edit" creates a Suggestion (note → PR open) → sign in as
  admin → approve & merge updates the note + version, status returns to stable.
- **Automated (vitest):** (a) cross-tenant read denied (inst A can't load inst B
  note), (b) role gating (USER cannot approve), (c) approve→merge updates Note
  body/version and Suggestion status. 
- **Security spot-checks:** malicious Markdown is sanitized; admin-only actions
  rejected for USER server-side even if UI bypassed.

## Notes / deferred
- AI suggestion review: not built now; `aiReview` field + `lib/review/ai.ts` stub
  reserved. When built, use the Anthropic **Claude API** with a current model
  (confirm via the claude-api reference at that time).
- Member-join mechanics kept minimal in v1 (creator=admin, admin invites by
  email / promotes); can be enriched later.
- Promote-to-canonical and subdomain tenancy are future, no schema change needed.
