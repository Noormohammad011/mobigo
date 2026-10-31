<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MobiGo

Mobile-phone-only e-commerce store for Bangladesh. Cash on Delivery only (no payment gateway in MVP).

## Source of truth
- `docs/PRD.md`: scope, page requirements, priorities
- `docs/DESIGN_SYSTEM.md`: tokens, breakpoints, component specs. Use the semantic tokens and never hard-code colors.
- `docs/SCHEMA.md`: data model, relationships, raw-SQL constraints, migration rules (§7)

## Stack
- Next.js 16 (App Router, `cacheComponents`), React 19, TypeScript, Tailwind CSS v4
- Prisma ORM **7.10.1** (pinned; Prisma 8 is still RC) with `@prisma/adapter-pg`. The client is generated to `src/generated/prisma` (gitignored; regenerated on `postinstall`).
- PostgreSQL 17: local via `docker compose`, hosted on **Supabase** (pooled `DATABASE_URL` for the app, `DIRECT_URL` for migrations)
- pnpm

## Supabase
- Project ref `mvytuzvpibveecixtlvi`. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` live in `.env.local`. Never put a secret/service_role key in a `NEXT_PUBLIC_` var.
- Clients: `src/lib/supabase/client.ts` (browser), `server.ts` (server components/actions). `src/proxy.ts` refreshes the session and guards only `/account` and `/admin`, so guests can browse and check out.
- Data access goes through Prisma (`src/lib/db.ts`). Use supabase-js for Storage (product images) and Auth only.

## Auth (Supabase Auth)
- `User.id` = Supabase auth user UUID. Get the signed-in user with `getCurrentUser()`; guard pages with `requireUser(next)` / `requireRole([...], next)` from `src/lib/auth/session.ts`. Never trust `getSession()` on the server.
- Roles come from the `User` table, never from `user_metadata`.
- Auth server actions live in `src/app/auth/actions.ts`. Email links land on `/auth/confirm`. Redirect targets always pass through `safeNextPath`.
- Every new table needs `ENABLE ROW LEVEL SECURITY` in its migration (docs/SCHEMA.md §8).

## Commands
- `pnpm db:up`: start local Postgres · `pnpm db:migrate`: create/apply migrations · `pnpm db:drift`: must print an empty migration
- `pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm build`

## Database rules
- Import the client only from `src/lib/db.ts` (server-only).
- Money is integer BDT. Prices and stock are always re-read on the server at checkout.
- Raw SQL objects (CHECKs, tsvector column, trigram index, `order_number_seq`) live in migration SQL. Run `pnpm db:drift` after every schema change and confirm no `DROP`.

## Project skills (`.claude/skills/`)
Stack: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `tailwind-design-system`, `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `supabase`, `supabase-postgres-best-practices`.
SEO: `seo-audit`, `programmatic-seo` (model "price in Bangladesh" pages), `schema-markup` (Product/Breadcrumb/FAQ JSON-LD), `site-architecture`, `ai-seo`.
