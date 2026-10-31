# 0001. Test setup: Vitest and Playwright against real Postgres and local Supabase

**Date**: 2026-10-31
**Status**: In Progress

## Summary

This spec sets up how MobiGo is tested. Vitest runs fast tests for plain functions, React components (in a simulated browser called jsdom) and database code (against a real `mobigo_test` Postgres database, with every test's writes undone afterwards). Playwright runs the real app in a real browser: a production build in its own folder and port, using a freshly seeded `mobigo_e2e` database and a local Supabase for sign in, with an automatic accessibility scan on every page it visits. Every later feature uses this to prove its acceptance criteria.

## Context

MobiGo has no tests yet. The scope makes the test setup the first foundation because the next slices carry rules that are only safe if proven against a real database: available stock (stock minus reserved stock), checkout that reserves stock in one transaction, a cart that merges after sign in. A mocked database would pass these tests while the real constraints (CHECKs, the composite foreign keys, `order_number_seq`) behave differently. The project rule in `docs/SCHEMA.md` and the `postgres` skill both say tests run against a real Postgres built from the real migrations.

Three things in this repo shape the setup. First, the app uses Next.js 16 with `cacheComponents`: data reads are `"use cache"` functions, and caching, prerendering and Suspense behave differently under `next dev` than in a production build. Second, `src/lib/db.ts` imports `server-only` and `next/cache` APIs, which do not load outside Next unless the test runner is told how. Third, two Claude sessions work in this folder at once and share `.next`, so a build started by one can break the other's server; `NEXT_PUBLIC_*` values are also baked into a build, so a test build that points at a local Supabase must never land in the shared `.next`.

Sign in runs on the hosted Supabase project, and there is no local Supabase stack yet. End to end tests that sign in need users they can create and delete freely, without touching real accounts. The project is not a git repository yet, so there is no hosted CI to run anything; commands must still be ready for one.

## Requirements

**User stories**:
- As a developer, I want one command that runs fast tests against a real database, so that a rule like available stock is proven, not assumed.
- As a developer, I want end to end tests to run the real production build in a real browser, so that caching and layout bugs show up before shoppers see them.
- As a developer working beside another session, I want test builds and servers isolated, so that running tests never breaks someone else's server.

**Acceptance criteria**:
- **AC-1**: `pnpm test` runs four Vitest projects (`unit`, `component`, `db`, `db-race`) in one run, and one sample test in each of `unit`, `component` and `db` passes. With the database down, `unit` and `component` still run and pass; only the database projects fail, with the AC-10 message.
- **AC-2**: `db` tests run against the `mobigo_test` database, migrated from `prisma/migrations` before the run. Every test's writes are rolled back, so a row created in one test is not visible in the next, and the dev database `mobigo` is never touched.
- **AC-3**: Test database helpers refuse to run when the database host is not local (`localhost`, `127.0.0.1`, `::1` or `[::1]`) or the database name does not end in `_test` or `_e2e`, and print why. Query strings such as `?schema=public` are ignored when checking the name.
- **AC-4**: Code under test that calls `db.$transaction(...)` works inside a `db` test, including nested calls. When the inner transaction fails, whether from a thrown error or a database constraint violation, only its own writes are undone and the test can still read the rows written before it.
- **AC-5**: Modules that import `server-only` and `"use cache"` functions that call `cacheLife`/`cacheTag` can be imported and run in Vitest (a test of `getNavBrands()` from `src/lib/queries/shell.ts` passes against seeded rows).
- **AC-6**: `pnpm test:e2e` migrates and seeds a fresh `mobigo_e2e` database first, then builds the app into `.next-e2e` (seed before build, because the home page is prerendered from seed data), then serves it with `next start` on port `3130` (overridable by `E2E_PORT`) against the local Supabase stack. It never writes to `.next` or uses ports `3000` or `3123` to `3129`.
- **AC-7**: A sample e2e test opens the home page in two Playwright projects, a 390px phone and a 1280px desktop. It sees the hero and at least one shelf, finds no horizontal overflow at 390px, and the axe scan reports zero `serious` or `critical` WCAG 2.2 A/AA violations.
- **AC-8**: A sign in fixture creates a confirmed user named `E2E Worker <n>` in local Supabase, signs in through the real `/auth/login` form once per worker, reuses the saved session, and the sample test sees `E2E Worker <n>` on `/account`. Every test user is deleted after the run, even when tests fail, and leftovers from a killed run are swept at the start of the next run.
- **AC-9**: The e2e build and server can only ever talk to local Supabase. `pnpm test:e2e` sets every Supabase variable itself (never inherits them from the shell or `.env.local`), refuses to start if the value it would use is not a local address, and after building fails if the hosted project ref `mvytuzvpibveecixtlvi` appears anywhere in `.next-e2e`. The Next server never receives the Supabase secret key.
- **AC-10**: When a prerequisite is missing, the command stops within 5 seconds with a message naming the command to fix it: database unreachable (2s connection timeout) → `pnpm db:up`; local Supabase not answering its health endpoint → `pnpm supabase:start`; generated Prisma client missing → `pnpm db:generate`.
- **AC-11**: `pnpm typecheck` and `pnpm lint` stay clean with the test files and configs included.

## Options considered

### Option 1: Real Postgres, transaction rollback per test, production build e2e with local Supabase

A `mobigo_test` database in the existing container for Vitest, each test wrapped in a transaction that is rolled back. Playwright drives `next build` plus `next start` in an isolated folder and port, with a seeded `mobigo_e2e` database and a local Supabase stack for sign in.

**Pros**:
- Constraints, triggers and raw SQL behave exactly as in production.
- Rollback is the fastest reset and lets test files run in parallel.
- The production build exposes cache and prerender behaviour that `next dev` hides.
- Test users live only on your machine.

**Cons**:
- Code that opens its own transaction needs a savepoint shim in tests.
- Tests that need two real concurrent transactions (stock races) cannot use rollback and need a slower path.
- Local Supabase adds several docker containers and a CLI.
- A production build makes the first e2e run slower (about a minute).

### Option 2: Mocked database and `next dev` e2e

Mock Prisma in unit tests and run Playwright against `next dev` with the hosted Supabase project.

**Pros**:
- No extra databases or containers; quick to start.
- Fast feedback while editing.

**Cons**:
- Mocks pass while real constraints fail; the stock and checkout rules would be unproven.
- `next dev` caching differs from production, so cache bugs hide.
- Tests would create users in the hosted project.

### Option 3: Testcontainers per run, truncate between tests

Each run starts a throwaway Postgres container; tables are truncated after each test.

**Pros**:
- Fully isolated from the dev container.
- Truncate works with any code, including real concurrent transactions.

**Cons**:
- Slower start on every run and needs docker access from the test runner.
- Truncation forces files to run one at a time.
- Adds a library the existing `docker compose` setup makes unnecessary.

## Decision

**Chosen option**: Option 1: Real Postgres, transaction rollback per test, production build e2e with local Supabase.

Vitest (projects `unit`, `component` on jsdom with Testing Library, `db` on `mobigo_test` with per test rollback, and `db-race` for real concurrent transactions) plus Playwright (Chromium at 390px and 1280px, against a production build in `.next-e2e` on port 3130, seeded `mobigo_e2e`, local Supabase, axe on every visited page).

**Implementation skills**: `postgres` (`~/.claude/skills/postgres/`, testing reference) · `supabase` (`supabase/agent-skills`, `.claude/skills/supabase/`, local CLI and auth) · `prisma-client-api` (`.claude/skills/prisma-client-api/`, interactive transactions) · `vercel-react-best-practices` (`.claude/skills/vercel-react-best-practices/`)

## Rationale

The rules coming next (available stock, reserving stock at checkout, merging a cart) live partly in the database: CHECK constraints, composite foreign keys and a sequence. Only a real Postgres built from the real migrations proves them, which rules out Option 2. Between the two real database options, rollback per test is much faster than truncation and keeps parallel files safe, and a second database in the container you already run costs nothing new, while Testcontainers adds a library and a slower start for isolation you already get from a separate database. The one thing rollback cannot do, real concurrent transactions, gets its own narrow path (see Standard definition, Exceptions) rather than slowing every test.

For end to end, `cacheComponents` is the deciding force: the home page is prerendered from `"use cache"` reads, and that only behaves like production in a production build. Building into `.next-e2e` on its own port solves two problems at once: the build collision with the other session, and the fact that `NEXT_PUBLIC_SUPABASE_URL` is baked into the build (an e2e build points at local Supabase and must never be the build anyone else serves). Local Supabase over fixed hosted test users keeps every test user on your machine and lets tests create and delete accounts freely, which cart merge and wishlist tests will need. The runner up was fixed hosted test users: simpler, but tests would then write to a real project.

Chromium at two sizes covers the layouts that actually differ (bottom nav, sheets, 2.2 vs 5 cards per row) at the lowest cost; WebKit can be added as a third project when an iPhone specific bug appears.

## Feature design

**Data model sketch**: no schema change. Two extra databases in the `mobigo-db` container: `mobigo_test` (Vitest, migrated only, each test seeds what it needs through factories) and `mobigo_e2e` (Playwright, migrated and seeded with `prisma/seed.ts` before each run). Local Supabase keeps its own Postgres for `auth.users` only; the app's `User` row is created by `getCurrentUser()` in `mobigo_e2e` on first visit, as in production.

**Test layout and naming**:
| Kind | File pattern | Vitest project / runner | Environment |
|---|---|---|---|
| Unit (pure functions) | `src/**/*.test.ts` | `unit` | node |
| Component | `src/**/*.test.tsx` | `component` | jsdom + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` |
| Database | `src/**/*.db.test.ts` (not `*.race.db.test.ts`) | `db` | node, `mobigo_test`, rollback per test, files in parallel |
| Database races | `src/**/*.race.db.test.ts` | `db-race` | node, `mobigo_test`, real commits, `fileParallelism: false` |

The `unit` project excludes `**/*.db.test.ts`, because `x.db.test.ts` also ends in `.test.ts`. The `component` project uses `@vitejs/plugin-react`, a `jest-dom` setup file and `css: false`. The `@/` alias comes from Vitest's own tsconfig paths support (no extra plugin).
| End to end | `e2e/**/*.spec.ts` | Playwright | Chromium, projects `phone` (390x844) and `desktop` (1280x800) |

**Commands** (added to `package.json`):
| Script | Does |
|---|---|
| `test` | `vitest run` (all four projects) |
| `test:watch` | `vitest` |
| `test:e2e` | `tsx scripts/e2e.ts`: checks prerequisites, prepares `mobigo_e2e`, builds into `.next-e2e`, then runs `playwright test` |
| `test:e2e:ui` | same, then `playwright test --ui` |
| `supabase:start` / `supabase:stop` | `supabase start` / `supabase stop` (CLI as a dev dependency) |

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Vitest `db`, `db-race` projects | test database URL | `TEST_DATABASE_URL`, default `postgresql://mobigo:mobigo@localhost:5432/mobigo_test` (same credentials as `docker-compose.yml`) |
| `db` setup file (runs before any import) | `DATABASE_URL`, `DIRECT_URL` in the test process | both overwritten with the test URL, so even an unmocked `@/lib/db` cannot reach `mobigo` |
| Vitest `db` global setup | the database itself | `pg` client to the `postgres` database on the same server: check `pg_database`, run `CREATE DATABASE` outside a transaction if missing |
| Vitest `db` global setup | schema | `prisma migrate deploy` spawned with `DIRECT_URL` and `DATABASE_URL` set to the test URL in the child env (Prisma 7 reads the URL from `prisma.config.ts`; there is no `--url` flag; `dotenv` does not override existing env) |
| `db` tests | the client code under test uses | `vi.mock("@/lib/db")` registered in the `db` setup file, returning the rollback proxy (see Standard definition); factories import the same `db` |
| e2e script | e2e database URL | `E2E_DATABASE_URL`, default `postgresql://mobigo:mobigo@localhost:5432/mobigo_e2e`; created the same way as `mobigo_test` |
| e2e script | e2e schema and data | `prisma migrate reset --force --skip-seed`, then `tsx prisma/seed.ts` once, both with `DIRECT_URL`/`DATABASE_URL` set to the e2e URL in the child env |
| e2e script | Supabase URL and keys | pinned Supabase CLI, `supabase status -o env`: `API_URL`; publishable key = `PUBLISHABLE_KEY ?? ANON_KEY`; secret key = `SECRET_KEY ?? SERVICE_ROLE_KEY`; clear error if any is missing. Nothing written to a committed file |
| e2e script | Supabase readiness | `GET http://127.0.0.1:54321/auth/v1/health` with a 3s timeout |
| e2e build and server | environment | built from an allowlist, never inherited: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_DIST_DIR`, `NODE_ENV=production`, plus `PATH`/`HOME`. Process env wins over `.env` files, so every var Next reads is set explicitly. The same set goes to `next build` and to `webServer.env` |
| e2e build and server | build folder | `NEXT_DIST_DIR=.next-e2e`, read by `next.config.ts` (`distDir: process.env.NEXT_DIST_DIR ?? ".next"`) for both `next build` and `next start` |
| e2e server | port, site URL, base URL | `E2E_PORT` default `3130`; `NEXT_PUBLIC_SITE_URL` and Playwright `baseURL` both `http://localhost:<port>` (same host string, so cookies match) |
| sign in fixture | test user email, password, name | generated per worker: `e2e-<worker>-<random>@e2e.mobigo.test`, a random 24 character password, `user_metadata.name = "E2E Worker <n>"`; never printed |
| sign in fixture | user creation and deletion | Supabase admin API (`email_confirm: true`) with the secret key, passed by the script to the Playwright process only as `E2E_SUPABASE_SECRET_KEY` |
| sign in fixture | the session | worker scoped fixture: real login once, `storageState` saved per worker, then `browser.newContext({ storageState })` per test |
| teardown | leftover users | sweep of every `@e2e.mobigo.test` user through paginated `admin.listUsers`, in global setup (crash leftovers) and global teardown. App `User` rows in `mobigo_e2e` are wiped by the next reset |
| axe helper | rules | tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`; fail on impact `serious` or `critical` |

**Key invariants**:
- No test helper connects to a non local host or to a database whose name does not end in `_test` or `_e2e` (AC-3). The same guard as `prisma/seed.ts`.
- The e2e build always points at local Supabase (AC-9) and always lives in `.next-e2e`.
- The Supabase secret key exists only in the Playwright and script processes; `webServer.env` is set explicitly so `next start` never inherits it.
- Tests never depend on each other's data: `db` tests create their rows through factories inside their own transaction; e2e tests read seed data or create their own users.
- Rollback tests never commit, so constraints declared `DEFERRABLE INITIALLY DEFERRED` would not fire: a test that needs one runs `SET CONSTRAINTS ALL IMMEDIATE` first, or lives in `db-race`.
- Sequences such as `order_number_seq` are not rolled back: tests never assert a specific order number, only its format and uniqueness.
- Real `"use cache"` behaviour (caching, tags, revalidation) is not covered by Vitest, where the directive is ignored and functions run uncached. It is covered only by e2e.
- `prisma/seed.ts` is reused unchanged. It rewrites the placeholder images in `public/seed/` on each e2e run; they are deterministic, so the files do not change.

**Security model**: test only infrastructure, nothing shipped to shoppers. The local Supabase keys are local defaults and are read at run time, not committed. `.env*` stays gitignored; add `.next-e2e/`, `playwright-report/`, `test-results/` and `supabase/.temp/` to `.gitignore`.

**Configuration required**:
- `TEST_DATABASE_URL`: optional override for the Vitest database.
- `E2E_DATABASE_URL`: optional override for the e2e database.
- `E2E_PORT`: optional, default `3130`.
- `E2E_SKIP_BUILD`: optional, `1` reuses an existing `.next-e2e` build for fast reruns. The prerendered pages then still show the data from when that build ran, so use it only when the seed has not changed.
- `NEXT_DIST_DIR`: optional build folder, read by `next.config.ts`; unset means `.next`.
- `supabase/config.toml`: created by `supabase init`; `site_url` and `additional_redirect_urls` set to `http://localhost:3130`. No email template changes (test users are created already confirmed).
- `tsconfig.json`: add `.next-e2e` to `exclude`; `eslint.config.mjs`: add `.next-e2e/**`, `playwright-report/**`, `test-results/**` to `globalIgnores`.
- `pnpm-workspace.yaml`: `allowBuilds` entry for `supabase` so its install step downloads the CLI binary.

**Critical test scenarios**:
- Happy path: `pnpm test` runs one unit, one component and one db test green, verifies **AC-1**, **AC-5**.
- Isolation: test A inserts a brand, test B counts brands and sees the original count, verifies **AC-2**.
- Nested transaction: a function that calls `db.$transaction` and throws leaves earlier rows in place, verifies **AC-4**.
- Guard: pointing `TEST_DATABASE_URL` at `mobigo` or a remote host fails with the guard message, verifies **AC-3**.
- E2E: home at 390px and 1280px, no overflow, axe clean, verifies **AC-6**, **AC-7**.
- Sign in: fixture user sees their name on `/account`; after the run, no `@e2e.mobigo.test` users remain, verifies **AC-8**.
- Safety: e2e with a hosted Supabase URL exported in the shell still builds against local Supabase; a build containing the hosted ref fails the scan; with the db container stopped, both commands fail fast naming `pnpm db:up` while `unit` and `component` still pass, verifies **AC-1**, **AC-9**, **AC-10**.
- Crash cleanup: kill a run mid test, start another, and no earlier `@e2e.mobigo.test` users remain afterwards, verifies **AC-8**.

## Standard definition

**Canonical pattern** (a database test):
```ts
// src/lib/queries/shell.db.test.ts
import { describe, expect, it } from "vitest"
import { db } from "@/lib/db" // the test proxy, bound to this test's transaction
import { makeBrand } from "@/test/factories"
import { getNavBrands } from "./shell"

describe("getNavBrands", () => {
  it("lists active brands by sort order", async () => {
    await makeBrand({ name: "Zeta", sortOrder: 2 })
    await makeBrand({ name: "Alpha", sortOrder: 1 })
    expect((await getNavBrands()).map((b) => b.name)).toEqual(["Alpha", "Zeta"])
  }) // rolled back automatically
})
```

Shared test code lives in `src/test/`: `setup/db.ts` (the rollback proxy and per test transaction), `setup/next.ts` (no op `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag`; `server-only` aliased to an empty module), `factories.ts` (one `makeX(overrides)` per model, valid defaults), `guard.ts` (AC-3). E2E helpers live in `e2e/fixtures.ts` (`signedInPage`, `expectNoA11yViolations`).

How the rollback proxy works (`src/test/setup/db.ts`):
- One real `PrismaClient` (pg adapter, test URL) per test file.
- `beforeEach` opens `client.$transaction(callback, { timeout: 60_000, maxWait: 10_000 })`. The callback stores `tx` in a module level `currentTx`, signals that the test may start, and waits until `afterEach` releases it, then throws a private `ROLLBACK` sentinel. `afterEach` releases it, awaits the transaction, swallows only the sentinel and rethrows anything else, then clears `currentTx`. Vitest `testTimeout` is 30s, below the transaction timeout.
- The mocked `db` is a `Proxy`: every property (model delegates, `$queryRaw`, `$executeRaw`) forwards to `currentTx`, and access with no `currentTx` throws "db used outside a test". `$connect`/`$disconnect` are no ops.
- `db.$transaction(fn, options?)`: increments a depth counter, runs `SAVEPOINT sp_<depth>` through `tx.$executeRawUnsafe`, calls `fn(tx)`, then `RELEASE SAVEPOINT sp_<depth>`; on any error (thrown or a constraint violation) it runs `ROLLBACK TO SAVEPOINT sp_<depth>` and rethrows (AC-4). Options such as `isolationLevel` and `timeout` are ignored inside a test.
- `db.$transaction([...])` (array form): one savepoint, awaits each operation in order, returns the results array.

**Replaces**: nothing (no tests exist). Going forward these are wrong: mocking Prisma or `@/lib/db` by hand in a test; connecting to the dev database from a test; running Playwright against `next dev` or the shared `.next`; creating users in the hosted Supabase project.

**Enforcement**: the guard (AC-3) and the e2e Supabase check (AC-9) fail at run time; Vitest `include` patterns route each file to its project by name; `/check review` checks new tests follow the pattern.

**Rollout**: new code immediately.

**Exceptions**: tests that must prove behaviour across two real concurrent transactions (for example two shoppers reserving the last unit) cannot share one rolled back transaction. They live in `*.race.db.test.ts` and run in the `db-race` project (`fileParallelism: false`, so race files never truncate each other's tables), with no `db` mock: they import a real client from `src/test/race-client.ts` on `mobigo_test` and clean up with `TRUNCATE ... CASCADE` of the tables they touched in `afterEach`.

## Build plan

Tracer Bullet: first one thread that proves each runner works end to end, then thicken.

1. Add dev dependencies (latest stable, exact versions; Vitest 4 or later for `projects` and tsconfig paths): `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`, `@axe-core/playwright`, `supabase` (pinned; add it to `allowBuilds`); install Chromium with `playwright install chromium` (system libraries may need a one time `sudo` install by you). Satisfies **AC-1**, **AC-6**.
2. `vitest.config.ts` with the `unit` and `component` projects, `server-only` aliased to `src/test/empty.ts`, and `src/test/setup/next.ts` (`vi.mock("next/cache")` with no op `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag`); sample tests for `formatBDT` and `QuantityStepper` (keyboard and limits). Satisfies **AC-1**, **AC-5**.
3. Test database thread: `src/test/guard.ts`, the `db` and `db-race` projects, global setup (prerequisite check, create `mobigo_test`, `migrate deploy`), the setup file (env override, `vi.mock("@/lib/db")`, rollback proxy with numbered savepoints), `factories.ts` for the catalog models. First confirm the generated Prisma 7 client loads under Vitest (inline it in `server.deps` if not). Tests: `getNavBrands`, isolation, nested transaction with a thrown error and with a unique constraint violation, guard refusals, and one sample race test. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-10**.
4. `next.config.ts` reads `NEXT_DIST_DIR`; `tsconfig.json` exclude, ESLint ignores and `.gitignore` additions. Announce to the other session before changing these shared files. Satisfies **AC-6**, **AC-11**.
5. Local Supabase: `supabase init`, `config.toml` site URL and redirect URLs; `supabase:start`/`supabase:stop` scripts; run `supabase status -o env` once to confirm the key names this CLI version prints. Satisfies **AC-8**, **AC-9**.
6. `scripts/e2e.ts`: prerequisite checks (database, Supabase health, generated client), the allowlisted env, local URL guard, create `mobigo_e2e`, `migrate reset --force --skip-seed` then the seed, `next build` into `.next-e2e` (skippable), the hosted ref scan of `.next-e2e`, then `playwright test` with `E2E_SUPABASE_SECRET_KEY`. `playwright.config.ts`: `phone` and `desktop` projects, `baseURL` on `localhost`, `webServer` running `next start -p $E2E_PORT` with an explicit `env` (no secret key) and `reuseExistingServer: false`. Satisfies **AC-6**, **AC-9**, **AC-10**.
7. `e2e/fixtures.ts` (`expectNoA11yViolations`; worker scoped `signedInPage` with the named user and saved `storageState`), global setup and teardown sweeping `@e2e.mobigo.test` users, `e2e/home.spec.ts` and `e2e/account.spec.ts`. Satisfies **AC-7**, **AC-8**.
8. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` clean. Satisfies **AC-11**.

## Consequences

**Positive**:
- Every later feature can prove its acceptance criteria against the real schema and the real build.
- The build folder fix also ends the collision between the two sessions for anyone who sets `NEXT_DIST_DIR`.
- Accessibility regressions on tested pages fail the run instead of reaching shoppers.

**Negative / tradeoffs**:
- Local Supabase adds several containers (roughly 1 to 2 GB of images) and a first start of a few minutes.
- The first `pnpm test:e2e` takes about a minute for the production build; `E2E_SKIP_BUILD=1` helps on reruns.
- The rollback proxy is home grown code that must keep pace with the Prisma client API; a Prisma upgrade may need it adjusted.
- Race tests are slower and must run one at a time.
- Only Chromium is tested; a Safari only bug will not be caught until WebKit is added.

**Neutral**:
- `mobigo_test` and `mobigo_e2e` live in the same docker volume as dev data; `pnpm db:down` with volume removal deletes all three.
- Hosted CI is deferred; the commands need only docker and pnpm, so a workflow can be added once the repo has a remote.

## Follow-up

- [ ] Add the new commands (`test`, `test:e2e`, `supabase:start`) and the test file naming to root `AGENTS.md` (`/sync` owns that file).
- [ ] Add a hosted CI workflow once the project is a git repository with a remote.
- [ ] Agent Skills and MCP servers for Vitest, Playwright and the Supabase CLI: not searched now, by your choice. A Playwright skill or MCP server could help `/check verify` drive the e2e build.
- [ ] Consider a WebKit phone project when iPhone specific issues appear.
