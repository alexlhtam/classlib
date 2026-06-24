# classlib — Knowledge Canvas

A collaborative class-notes library with GitHub-style pull-request review for
edits. Students read the canonical version of a note, suggest changes (which open
a "PR"), and maintainers review the diff before it merges.

This is being rebuilt from a browser-only prototype into a **deployable,
multi-tenant Next.js application** per [`docs/plan.md`](docs/plan.md). The
original static prototype is preserved in [`legacy/`](legacy/) as the visual
reference.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Auth.js (NextAuth v5)** — Google OAuth + email/password
- **Prisma** + **PostgreSQL** — per-institution multi-tenancy (seeded copy per
  institution; every tenant-scoped row carries `institutionId`)
- Server Markdown + KaTeX rendering, LCS diff for PR review

## Status

Phases 1–2 of the plan are in place: scaffold, schema + first migration, canonical
content + seed, auth, and the tenancy gate. The read/write UI (Phases 3–5) and
deploy (Phase 6) are still to come.

## Local development

Requires Node 20+ and a PostgreSQL database.

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env                                   # then set DATABASE_URL (+ optional Google creds)
echo "AUTH_SECRET=\"$(openssl rand -base64 33)\"" >> .env   # required: generate a real secret

# 3. Apply schema + seed demo data
npm run db:migrate         # prisma migrate dev
npm run db:seed            # demo institution + admin/student + content

# 4. Run
npm run dev                # http://localhost:3000
```

> **Restart `npm run dev` after editing `.env`** — Next.js only reads env files
> at startup. A missing/unloaded `AUTH_SECRET` is the usual cause of Auth.js's
> generic *"There was a problem with the server configuration"* error.

Demo credentials (from the seed):

- Admin — `admin@demo.classlib` / `password123`
- Student — `student@demo.classlib` / `password123`

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (diff + tenancy gate) |
| `npm run db:migrate` / `db:seed` / `db:studio` / `db:reset` | Prisma helpers |

### Note on Prisma engines (restricted networks)

If the Prisma engine auto-download is blocked, fetch the query + schema engines
manually and point Prisma at them via `PRISMA_QUERY_ENGINE_LIBRARY` and
`PRISMA_SCHEMA_ENGINE_BINARY` (see `.env.example`).

## Deployment (Phase 6)

Target is Vercel + hosted Postgres (Neon/Supabase). Set `DATABASE_URL`,
`AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET` (and optional
`BLOB_READ_WRITE_TOKEN`), run `prisma migrate deploy`, and configure the Google
OAuth callback. Not yet wired — requires project credentials.
