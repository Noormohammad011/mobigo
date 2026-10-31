# 0011 · COD checkout

**Date**: 2026-10-31
**Status**: In Progress

## Summary

Shoppers complete Cash on Delivery checkout at `/checkout`. The server re reads cart lines, prices, and stock, then creates a `PENDING` order in one database transaction while reserving stock. Guest carts post lines with the form; signed in shoppers use the Postgres cart. A subtotal cap and a limit of three pending orders per phone reduce abuse. Confirmation shows the sequence based order number.

## Context

MobiGo sells phones with COD only in the MVP. Checkout must never trust client prices or stock counts. The schema already defines orders, snapshots, delivery zones, and stock reservation via `reservedStock` (SCHEMA decision 6). Cart (spec 0010) holds lines until checkout; this spec owns placing the order and reserving inventory.

## Requirements

**User stories**:
- As a guest shopper, I want to enter my address and place a COD order without an account so that I can buy quickly.
- As a signed in shopper, I want checkout to use my server cart and clear purchased lines so that my cart stays accurate.
- As the store, I want stock reserved atomically with the order so that two shoppers cannot oversell the last unit.

**Acceptance criteria**:
- **AC-1**: `/checkout` (flag `cod_checkout`) shows delivery fields (name, BD mobile, optional email, district, area, address, optional note), COD copy per CO-3, and order totals with delivery fee from the selected district's zone (CO-1, CO-2, CO-3).
- **AC-2**: Signed in checkout reads lines from `Cart`/`CartItem`; guest checkout reads lines from the posted guest cart payload validated on the server (cart spec 0010 guest shape).
- **AC-3**: `placeOrder` re reads variant price from `ProductVariant.price` and availability via `getVariantAvailability`; only reason `ok` may checkout (preorder and out of stock rejected with line level errors) (CO-4, CA-3, stock spec 0002).
- **AC-4**: Successful place creates `Order` status `PENDING`, `OrderItem` snapshots, initial `OrderStatusHistory`, order number from `order_number_seq`, increments `reservedStock` with conditional SQL (exactly one row updated per line), syncs `Product.inStock`, clears purchased `CartItem` rows for signed in users, redirects to `/checkout/confirmation?order=…` (CO-4, SCHEMA decision 6).
- **AC-5**: Subtotal above `Setting.order_max_subtotal` (default 300000 BDT) returns a clear refusal without creating an order (scope cap).
- **AC-6**: Fourth `PENDING` order for the same normalized `customerPhone` is refused with a clear message (CO-6).
- **AC-7**: Stock race: if conditional reserve updates zero rows, the transaction rolls back and the shopper sees a line level stock error (no silent drop).
- **AC-8**: `checkout_start` and `order_placed` analytics events fire with no personal data in properties (analytics spec 0004).

## Options considered

### Option 1: Server cart only (force sign in before checkout)

**Pros**: Simpler trust boundary.

**Cons**: Blocks PRD guest checkout (CO-1).

### Option 2: Guest lines posted with place order (chosen)

**Pros**: Matches PRD; server still re validates every line.

**Cons**: Client could tamper with variant ids; server rejects invalid or unavailable lines.

### Option 3: Payment gateway stub

**Pros**: Future online pay.

**Cons**: Out of MVP scope.

## Decision

**Chosen option**: Option 2: Guest lines posted with place order, full server re validation.

**Implementation skills**: `prisma-client-api` (`.claude/skills/prisma-client-api/`), `supabase` (auth session only, `.claude/skills/supabase/`)

## Rationale

PRD requires guest COD checkout. The cart spec already stores guest lines locally; checkout must not trust their prices. Reusing `getVariantAvailability` and live `price` keeps listing, cart, and checkout aligned. Reservation stays in raw SQL because Prisma cannot express `stock - reservedStock >= qty`. Order numbers use the existing Dhaka dated sequence.

## Feature design

**Data model sketch**:
- Uses existing `Order`, `OrderItem`, `OrderStatusHistory`, `DeliveryZone`, `DeliveryZoneDistrict`, `ProductVariant.reservedStock`, `Setting` key `order_max_subtotal`.
- No new tables in this feature.

**State transitions**:
- Checkout creates `Order.status = PENDING` only. Further transitions belong to admin orders (feature 20).

**API surface**:
| Surface | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/checkout` | GET | | Checkout form, zones | optional session | 404 if flag off |
| `placeOrderAction` | POST (form) | address fields, guest lines bound server side | redirect or field errors | optional | validation, lines, cap, pending_limit |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Place order | Line unit price | `ProductVariant.price` at place time |
| Place order | Line quantity cap | `quantityAllowed` + `getVariantAvailability` (spec 0002) |
| Place order | Subtotal | Sum of live unit price × qty |
| Place order | Delivery fee | `DeliveryZone.fee` via `DeliveryZoneDistrict.district` |
| Place order | Division | `divisionForDistrict(district)` in `src/lib/bd-locations.ts` |
| Place order | Order number | SQL `order_number_seq` (SCHEMA decision 10) |
| Place order | Pending count | `count(PENDING orders where customerPhone = normalized phone)` |
| Place order | Subtotal cap | `Setting.order_max_subtotal` or default 300000 |
| UI | District list | `DeliveryZoneDistrict` joined to active zones |

**Key invariants**:
- Money integers BDT; order CHECK constraints on totals.
- `customerPhone` normalized to `01XXXXXXXXX` before persist.
- Reservation and order insert in one transaction; failure rolls back all reserves.

**Security model**:
- Public checkout with rate limits deferred to order tracking for lookup abuse; pending order cap per phone (AC-6).
- Signed in orders attach `userId`; guest orders leave `userId` null.

**Configuration required**:
- `FLAGS` may enable `cod_checkout` locally (spec 0003).
- `order_max_subtotal` in `Setting` (seed default 300000).

**Critical test scenarios**:
- Happy path single line order reserves stock and returns order number → AC-4
- Preorder variant rejected at resolve → AC-3
- Subtotal over cap → AC-5
- Three pending then fourth blocked → AC-6
- Concurrent reserve failure → AC-7

## Build plan

- [x] Order helpers: number, reserve stock, settings cap, place order transaction (AC-4, AC-5, AC-6, AC-7)
- [x] Checkout UI and `placeOrderAction` (AC-1, AC-2, AC-8)
- [x] Cart link to checkout and confirmation page (AC-1)

## Consequences

**Positive**: End to end buy path; stock reserved at order time; aligns with SCHEMA.

**Negative**: Order number sequence skips on failed transactions (acceptable per SCHEMA). Guest cart not cleared server side (client clears on confirmation page).

**Follow up**:
- CO-5 confirmation email (P1).
- Checkout rate limiting by IP (optional).
- Preorder checkout policy if product policy changes.

## References

- PRD §4.8 Checkout (CO-1 to CO-6)
- `docs/SCHEMA.md` decisions 6 and 10
- Spec 0002 available stock rule
- Spec 0010 cart
