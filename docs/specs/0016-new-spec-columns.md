# 0016 · New spec columns

**Date**: 2026-10-31
**Status**: In Progress

## Summary

Compare and future listing filters need two more denormalized numbers on `Product`: main rear camera megapixels and display refresh rate in hertz. A migration adds the columns with CHECK constraints. Seed, spec backfill, and admin product save keep them in sync with the spec sheet logic from spec 0015.

## Context

MobiGo keeps fast filters on `Product` while the full spec sheet stays in EAV (SCHEMA decision 3). Display size, battery, chipset, RAM, and storage already live on `Product`. Camera main MP and refresh rate are key compare rows in the spec catalog but were only stored as text in `SpecValue`. Feature 16 materializes them as typed columns so compare and filters can use them without joining EAV.

## Requirements

**User stories**:
- As a shopper, I want compare and filters to use consistent camera and refresh numbers so that phones match what the spec sheet shows.
- As staff, I want saves to refresh denormalized columns automatically so the storefront never drifts.

**Acceptance criteria**:
- **AC-1**: Migration adds nullable `Product.mainCameraMp` (integer) and `Product.refreshRateHz` (integer) with SQL CHECKs `mainCameraMp BETWEEN 1 AND 200` and `refreshRateHz BETWEEN 60 AND 240` when not null.
- **AC-2**: `pnpm db:migrate` applies cleanly and `pnpm db:drift` prints an empty migration after schema change.
- **AC-3**: Seed sets both columns for every seeded phone using the same rules as `specValuesForProduct` in `prisma/spec-sheet.ts` (main MP from slug hash helper, refresh 120 when network is G5 else 90).
- **AC-4**: `scripts/backfill-specs.ts` upserts both columns on each product it touches, idempotent with explicit `--target=` only.
- **AC-5**: Flag `spec_columns` gates any shopper facing use added in later features; this feature only adds data plumbing and docs in SCHEMA decision 9 table.
- **AC-6**: `docs/SCHEMA.md` decision 9 row lists both columns as updated on product or variant save (admin catalog spec 0018 will implement the writer).

## Options considered

### Option 1: Read camera and refresh only from EAV at compare time

**Pros**: No migration.

**Cons**: Compare page joins many rows; scope asks for columns and drift checked migration.

### Option 2: Denormalize mainCameraMp and refreshRateHz on Product (chosen)

**Pros**: Matches SCHEMA pattern; seed and backfill already centralize spec logic.

**Cons**: One more field to keep in sync on admin save.

## Decision

**Chosen option**: Option 2: Denormalize `mainCameraMp` and `refreshRateHz` on `Product`.

**Implementation skills**: `prisma-cli` (`.claude/skills/prisma-cli/`), `prisma-client-api` (`.claude/skills/prisma-client-api/`)

## Rationale

The spec catalog already defines Camera main MP and Display refresh rate as comparable attributes. Storing them on `Product` follows the same rule as `batteryMah` and `displaySizeIn`. Typed integers enable future listing filters without parsing strings.

## Feature design

**Data model sketch**:
- `Product.mainCameraMp Int?`
- `Product.refreshRateHz Int?`
- CHECK constraints in migration SQL only.

**API surface**: None in this feature (data only).

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Seed mainCameraMp | Integer MP | `mainMp(slug)` in `prisma/spec-sheet.ts` |
| Seed refreshRateHz | 120 or 90 | `product.network === G5` ? 120 : 90 |
| Backfill | Same as seed | Read product slug and network from DB |
| Admin save (0018) | Recompute both | Shared helper exported from `prisma/spec-sheet.ts` or `src/lib/catalog/denormalize-product.ts` |

**Key invariants**:
- Nullable until backfill runs on old rows.
- Writers must not parse EAV at read time for these two fields once admin save exists.

**Security model**: Columns are not secret; RLS unchanged.

**Critical test scenarios**:
- Migration applies on empty and seeded DB → AC-1, AC-2
- Seed twice yields same MP per slug → AC-3
- Backfill run twice same counts → AC-4

## Build plan

- [x] Prisma schema plus migration with CHECKs (AC-1, AC-2)
- [x] Extend `spec-sheet.ts` and seed to set columns (AC-3)
- [x] Extend `backfill-specs.ts` (AC-4)
- [x] Export recompute helper for admin catalog (AC-6)
- [x] Update SCHEMA.md decision 9 table (AC-5, AC-6)

## Consequences

**Positive**: Compare and filters can use integers; aligns with scope done when.

**Negative**: Dual write with SpecValue text until admin enforces one helper.

**Follow up**:
- Listing filters for camera MP and refresh bands (optional, spec 0005 ratify).

## References

- `docs/SCHEMA.md` decision 3 and 9
- Spec 0015 full spec data
- Scope feature 16
