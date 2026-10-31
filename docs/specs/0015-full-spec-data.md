# 0015 · Full spec data

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
Exact spec sheet taxonomy was not deliberated.

## Assumption built on
Shared catalog in `prisma/spec-sheet.ts`: groups Display, Platform, Battery, Camera, Connectivity with fixed attributes. Seed upserts groups or attributes then writes SpecValue per product from catalog denormalized fields plus deterministic placeholders for camera and connectivity. Backfill script `scripts/backfill-specs.ts` requires `--target=` host allowlist (localhost or Supabase pool host from env), idempotent upsert by product slug, touches only SpecGroup, SpecAttribute, SpecValue.

## Code area
`prisma/spec-sheet.ts`, `prisma/seed.ts`, `scripts/backfill-specs.ts`

## Requirements
- Every seeded phone has all spec groups filled
- Backfill safe to run twice; explicit target only

## Ratify
Run `/architect full spec data` to ratify.

## Build plan
- [x] Spec sheet module and seed integration
- [x] Backfill script
