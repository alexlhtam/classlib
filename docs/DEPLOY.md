# Deploying classlib

classlib is a standard Next.js (App Router) + Prisma/Postgres app. The reference
target is **Vercel + a hosted Postgres** (Neon or Supabase), but any Node host +
Postgres works.

> Live deploy needs accounts/secrets only you have (a Postgres URL, an auth
> secret, and — if you want Google sign-in — Google OAuth credentials). The steps
> below are the exact checklist; nothing here runs automatically.

## 1. Provision Postgres

Create a database on **Neon** or **Supabase** and copy its connection string. For
serverless/edge-pooled providers, append `?sslmode=require` (and use the pooled
URL for the app). Example:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

## 2. (Optional) Google OAuth

Email+password works without this. For Google sign-in, create an OAuth client at
the Google Cloud Console → Credentials → "OAuth client ID" (Web application):

- **Authorized redirect URI:** `https://YOUR_DOMAIN/api/auth/callback/google`
- For local dev also add `http://localhost:3000/api/auth/callback/google`

Copy the client ID + secret.

## 3. Environment variables

Set these in the Vercel project (Settings → Environment Variables), matching
`.env.example`:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | hosted Postgres connection string |
| `AUTH_SECRET` | yes | `openssl rand -base64 33` |
| `AUTH_URL` | yes (prod) | `https://YOUR_DOMAIN` |
| `GOOGLE_CLIENT_ID` | optional | enables Google sign-in |
| `GOOGLE_CLIENT_SECRET` | optional | enables Google sign-in |

## 4. Build & migrate

The repo ships a `vercel-build` script that Vercel runs automatically:

```
prisma generate && prisma migrate deploy && next build
```

`prisma migrate deploy` applies committed migrations (in `prisma/migrations/`) to
the production database on every deploy — no manual migration step needed. (If
your host doesn't pick up `vercel-build`, set the Build Command to that string.)

## 5. Deploy

1. Push the repo to GitHub and **Import Project** in Vercel (framework: Next.js).
2. Add the env vars from step 3 (Production + Preview).
3. Deploy. The build runs migrations, then builds.

## 6. Seed first content (optional)

Production starts with an empty database. Two ways to get content:

- **Self-serve (recommended):** register an account, then **Create a classlib** —
  each new institution is auto-seeded with the canonical course content.
- **Demo data:** run the seed once against the production DB from your machine:
  ```
  DATABASE_URL="<prod url>" npm run db:seed
  ```
  (creates the `demo` institution + `admin@demo.classlib` / `student@demo.classlib`,
  password `password123` — change or remove these for a real deployment).

## 7. Post-deploy smoke test

1. Visit `https://YOUR_DOMAIN` → landing renders.
2. Register / sign in (and Google, if configured).
3. Create a classlib → it lands seeded with modules + notes.
4. Open a note → Markdown, LaTeX, and diagrams render.
5. Suggest an edit → a PR opens; as a maintainer, approve & merge → the note
   updates and its version bumps.

## Notes

- **Tenant isolation & role gating** are enforced server-side (`lib/tenancy.ts`),
  so they hold regardless of the client.
- **Restricted networks:** if Prisma's engine download is blocked in your build
  environment, see the "Note on Prisma engines" section in `README.md`.
- **Future:** AI-assisted suggestion review is stubbed at `lib/review/ai.ts`
  (uses the Anthropic Claude API when built); image/handwriting uploads were
  intentionally deferred (they would bypass the text-diff review/moderation gate).
