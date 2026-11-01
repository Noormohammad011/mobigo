# 0017 · Compare

**Date**: 2026-10-31
**Status**: Accepted

## Summary

Shoppers build a compare list of up to three phones stored in the browser. A floating pill shows the count and links to `/compare`. The page loads spec groups from the database, shows three columns on large screens and two on mobile, and can highlight cells where values differ. No cell claims better or worse. The feature sits behind flag `compare`.

## Context

PRD CP-1 and CP-2 require side by side specs with persistence and a compare pill. Product detail and cards already expose compare entry points in the PRD (P-10, C-4). Spec data exists in EAV (spec 0015). This spec owns client list storage, the compare route, and UI only.

## Requirements

**User stories**:
- As a shopper, I want to add phones to compare and return later so that I can decide between models.
- As a shopper, I want to see specs grouped like the product page so that I can scan fairly.
- As a shopper, I want to highlight differences without being told which phone wins.

**Acceptance criteria**:
- **AC-1**: Flag `compare` off hides header Compare link, PDP add control, card toggle, and pill; `/compare` returns not found via `assertFlag("compare")`.
- **AC-2**: localStorage key `mobigo_compare` stores an ordered JSON array of product slugs, max 3 unique slugs; adding a fourth removes the oldest or ignores with toast (chosen: drop oldest FIFO).
- **AC-3**: Floating fixed pill `Compare (n)` visible when `n > 0`, links to `/compare`, sits above mobile bottom nav (z-index per DESIGN_SYSTEM bar layer), hidden when flag off.
- **AC-4**: `/compare` server loads active products by slug from the list; unknown or inactive slugs are dropped client side after load with a message.
- **AC-5**: Table grouped by `SpecGroup.sortOrder`, attributes by `SpecAttribute.sortOrder`; only attributes with `isComparable true`; cell text from `SpecValue.value`.
- **AC-6**: Layout shows min(list length, 3) columns on `lg`, min(list length, 2) on smaller breakpoints (PRD two on mobile).
- **AC-7**: Toggle "Highlight differences" adds a distinct background on cells whose trimmed value differs from at least one other column in the same row; toggle off removes styling.
- **AC-8**: No UI copy labels a value as better, worse, winner, or recommended (PRD C-4).
- **AC-9**: Empty compare list shows empty state with link to `/phones`.
- **AC-10**: `compare_add` analytics event on add (product id only, spec 0004).

## Options considered

### Option 1: Compare list in server cart for signed in users only

**Pros**: Sync across devices.

**Cons**: Breaks PRD localStorage persistence for guests.

### Option 2: localStorage slug list plus server rendered table (chosen)

**Pros**: Matches PRD CP-2; server reads authoritative spec values.

**Cons**: List does not sync across devices.

## Decision

**Chosen option**: Option 2: localStorage slug list plus server rendered compare page.

**Implementation skills**: `web-design-guidelines` (`.claude/skills/web-design-guidelines/`), `tailwind-design-system` (`.claude/skills/tailwind-design-system/`)

## Rationale

PRD explicitly persists compare in localStorage. Loading specs on the server keeps values aligned with the catalog and avoids trusting client spec text.

## Feature design

**Data model sketch**: No new tables. Reads `Product`, `SpecGroup`, `SpecAttribute`, `SpecValue`.

**API surface**:
| Surface | Method | Inputs | Outputs | Auth |
|---|---|---|---|---|
| `/compare` | GET | query `slugs` optional | Compare page | public |
| Client store | | slug add/remove | updates localStorage | n/a |

**Value sourcing**:
| UI value | Source |
|---|---|
| Compare list | `mobigo_compare` JSON parse |
| Spec cell | `SpecValue.value` for product and attribute |
| Product title | `Product.name` |
| Thumbnail | first `ProductColor.images[0]` |
| Column count cap | breakpoint + list length (AC-6) |
| Highlight | string equality of trimmed cell values across visible columns |

**Key invariants**:
- Max three slugs in storage.
- Compare never ranks numeric values.

**Security model**: Public read only. Slugs validated against ACTIVE or PREORDER products server side.

**Critical test scenarios**:
- Three slugs persist reload → AC-2
- Toggle highlights only differing rows → AC-7
- Flag off hides pill and 404 page → AC-1

## Build plan

- [x] Client compare store module plus pill component (AC-2, AC-3)
- [x] Wire PDP and product card add/remove (AC-1, AC-10)
- [x] Header Compare link behind flag (AC-1)
- [x] `/compare` page and query loader (AC-4, AC-5, AC-6, AC-9)
- [x] Highlight differences client toggle (AC-7, AC-8)

## Consequences

**Positive**: Delivers slice 5 compare page without admin dependency.

**Negative**: Stale slugs after a product is discontinued are dropped silently.

## References

- PRD §4.6 Compare CP-1, CP-2, C-4
- Spec 0003 feature flags (`compare`)
- Spec 0015 spec data
