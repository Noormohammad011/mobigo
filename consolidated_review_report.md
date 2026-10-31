# Consolidated review · scope features 1 through 5

Date: 2026-10-31  
Context: `docs/scope/scope.md`, specs `0001` through `0005`, and the code paths named in those specs.  
Runtime check: `/check verify` was run against `http://localhost:3000` with local Postgres.

## Summary

The harness and listing slice are real enough to click through, but feature 1 does not meet its own spec until sample tests exist and `pnpm test` succeeds. Feature 3 is typed scaffolding only, so the scope “dashboard” line is still false. Assumed specs `0003`, `0004`, and `0005` record debt clearly, yet they are not substitutes for deliberation before you treat analytics or listing as done. The stock rule pure logic checks out in a small script run; server batch reads were not exercised in this verify pass because `server-only` blocks a standalone script.

## Blockers

| ID | Feature | Finding |
|----|---------|---------|
| B1 | 1 · Test setup | Spec `0001` AC-1 requires sample tests in `unit`, `component`, and `db`, and a passing `pnpm test`. The run exits with “No test files found” (exit code 1). Harness files exist; the acceptance gate is not met. |
| B2 | 1 · Test setup | AC-6 through AC-8 (e2e home sample, axe, signed in fixture) were not run in verify. No e2e spec files exist. |
| B3 | 3 · Analytics | Scope done when includes events visible in a tool dashboard. `track()` is intentionally a no op. That matches the assumption in `0004`, but it fails the scope bar until a provider is chosen and wired. |
| B4 | 4 · Stock rule | Spec build plan still expects unit, db, and component tests. None were written (engineer waived tests). AC-1 server batch reads were not runtime proven in verify (blocked outside Next/db test project). |

## Major

| ID | Feature | Finding |
|----|---------|---------|
| M1 | 2 · Feature flags | Assumed spec `0003` is fine as a placeholder. Every planned name exists in `FLAG_NAMES`. Verify proved `/phones` returns 404 when `product_listing` is false and 200 when true (SQL update on `Setting`). Fresh DB without re-seed had no `feature_flags` row until insert; seed code adds it but existing DBs need `pnpm db:seed`. |
| M2 | 5 · Product listing | `/phones`, `/brands/samsung`, and `/collections/new-arrivals` return 200 with flag on. Filters, sort controls, product grid, “Load more”, and numbered pages appear in the accessibility snapshot at `http://localhost:3000/phones`. Canonical link renders as `/phones`. Empty filter URL shows “Clear filters” text when `min=99999999`. Assumed filter vocabulary in `0005` was not ratified with `/architect`. |
| M3 | 4 · Stock rule | `classifyVariant` / `classifyProduct` / `quantityAllowed` behave as specced in a tsx one off (preorder variant returns reason `preorder`, cap 5). `QuantityStepper` shows “Unavailable” when max is 0 (code review plus spec AC-9). Seed uses `classifyProduct` for `inStock` (code present; not re-run in verify). |
| M4 | 1 · Test setup | AC-3 guard accepts `mobigo_test` and rejects remote host (verified). AC-11 typecheck and lint pass. AC-2 db rollback path not exercised without a db test file. |
| M5 | Docs | Prior `goldfish_review_report.md` on specs `0001` and `0002` is still unresolved. This report does not supersede it. |

## Nits

| ID | Feature | Finding |
|----|---------|---------|
| N1 | 1 | Vitest prints a native config loader warning for `vitest.config.ts`. |
| N2 | 5 | “Load more” navigates to the next page; spec assumption says it does not append in place. Confirm that matches product intent after ratification. |
| N3 | 2 | Flag key `feature_flags` in `FLAG_NAMES` overlaps the settings key name conceptually; easy to confuse when reading `readFlags()`. |

## Traceability

| Feature | Spec | Top risks |
|---------|------|-----------|
| 1 | 0001 | B1, B2, M4, N1 |
| 2 | 0003 (Assumed) | M1 |
| 3 | 0004 (Assumed) | B3 |
| 4 | 0002 | B4, M3 |
| 5 | 0005 (Assumed) | M2, N2 |

## Recommended next steps

1. Add the sample tests spec `0001` names, or narrow the spec if you intentionally ship harness only.  
2. Run `/architect` on flags, analytics, and listing to ratify assumed specs, or accept Assumed and mark features done with eyes open.  
3. Wire analytics or drop the dashboard line from scope until a provider exists.  
4. Add at least one db test that calls `getVariantAvailability` so AC-1 is repeatable without Next.  
5. Re-run `/check verify` after tests land; then `/test` per Beta workflow.
