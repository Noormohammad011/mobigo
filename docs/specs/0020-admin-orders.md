# 0020 · Admin orders

**Date**: 2026-10-31
**Status**: Proposed

## Summary

Staff manage COD orders under `/admin/orders`. They filter the list, open detail, and move status along the PRD lifecycle with optional notes. Every change appends `OrderStatusHistory`. Stock moves follow SCHEMA decision 6: release reserve on cancel, consume on deliver, restock on return. Only `transitionOrder` may change status.

## Context

Checkout (spec 0011) creates `PENDING` orders and reserves stock. PRD AD-5 and the order lifecycle diagram define allowed moves and audit needs. SCHEMA decision 8 requires a single transition service. This feature is GA tier in scope because it touches money and inventory.

## Requirements

**User stories**:
- As staff, I want to confirm or cancel pending orders after calling the customer.
- As staff, I want a status timeline with notes so the team shares context.
- As the store, I want stock to stay correct when orders cancel, deliver, or return.

**Acceptance criteria**:
- **AC-1**: Flag `admin_orders` gates `/admin/orders/**`.
- **AC-2**: `requireRole(["STAFF", "ADMIN"], next)` on all routes and actions.
- **AC-3**: Order list: filters status (multi), date range on `placedAt`, search by order number or customer phone; sort newest first; page size 20.
- **AC-4**: Order detail shows customer snapshot, lines, totals, zone, payment method COD, current status, and full history newest first.
- **AC-5**: `transitionOrder({ orderId, toStatus, note, actorId })` is the only code path that sets `Order.status`.
- **AC-6**: Allowed transitions: `PENDING` → `CONFIRMED` | `CANCELLED`; `CONFIRMED` → `SHIPPED` | `CANCELLED`; `SHIPPED` → `DELIVERED` | `CANCELLED`; `DELIVERED` → `RETURNED`. Any other pair returns a clear error without mutation.
- **AC-7**: Each successful transition sets the matching timestamp column (`confirmedAt`, `shippedAt`, `deliveredAt`, `cancelledAt`) when first entering that terminal branch status.
- **AC-8**: Appends `OrderStatusHistory` with fromStatus, toStatus, note, changedById in the same transaction.
- **AC-9**: Stock effects in the same transaction per SCHEMA decision 6: `CANCELLED` from a status that still holds reservation releases `reservedStock` on each line variant; `DELIVERED` decrements `stock` and `reservedStock` by line qty; `RETURNED` increments `stock` by line qty (does not re reserve); after variant changes run `syncProductInStock` for affected products.
- **AC-10**: Invalid transition or stock SQL failure rolls back entire transaction and surfaces error to staff UI.
- **AC-11**: Staff may set `paymentStatus` to `PAID` on delivered orders via separate action (COD remittance), does not change order status.
- **AC-12**: DB tests cover cancel release, deliver consume, return restock, and illegal transition (spec 0001 pattern).

## Options considered

### Option 1: Direct status updates in admin actions

**Pros**: Faster to write.

**Cons**: Violates SCHEMA decision 8; easy to miss stock side effects.

### Option 2: Central transitionOrder service (chosen)

**Pros**: One place for rules, history, and stock.

## Decision

**Chosen option**: Option 2: Central `transitionOrder` in `src/lib/orders/transition-order.ts`.

**Implementation skills**: `prisma-client-api`, `prisma-cli`, `test-driven-development` for AC-12

## Rationale

Matches SCHEMA and PRD diagram. Reuses `reserveVariantStock` patterns in reverse for release and deliver.

## Feature design

**State transitions**:
```
PENDING → CONFIRMED | CANCELLED
CONFIRMED → SHIPPED | CANCELLED
SHIPPED → DELIVERED | CANCELLED
DELIVERED → RETURNED
```

**Stock side effects** (variant level, sorted ids):
| Transition | Effect |
|---|---|
| → CANCELLED | `reservedStock -= qty` where order had reserved (PENDING, CONFIRMED, SHIPPED) |
| → DELIVERED | `stock -= qty`, `reservedStock -= qty` |
| → RETURNED | `stock += qty` |

**API surface**:
| Surface | Purpose |
|---|---|
| `/admin/orders` | List |
| `/admin/orders/[id]` | Detail plus transition form |
| `transitionOrderAction` | POST status plus note |
| `markOrderPaidAction` | POST paymentStatus PAID |

**Value sourcing**:
| Value | Source |
|---|---|
| Order lines | `OrderItem` snapshot |
| Actor | `getCurrentUser()` id |
| Phone search | Normalized same as checkout |

**Key invariants**:
- Cannot deliver without shipped unless transition table allows (must go SHIPPED before DELIVERED).
- Raw SQL updates check row count like reserve.

**Security model**: STAFF+ only; no customer access to admin routes.

**Critical test scenarios**:
- PENDING cancel releases reserve → AC-9
- SHIPPED deliver reduces stock → AC-9
- DELIVERED return increases stock → AC-9
- PENDING → DELIVERED rejected → AC-6

## Build plan

1. `transitionOrder` core plus unit/db tests (AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-12)
2. Admin list and filters (AC-3)
3. Admin detail and history (AC-4)
4. Transition form action (AC-5)
5. Mark paid action (AC-11)
6. Flag and role gates (AC-1, AC-2)

## Consequences

**Positive**: Safe ops path for COD fulfillment.

**Negative**: Complex stock edge cases if staff cancel after ship (handled by transition table).

**Follow up**:
- Email customer on status change (CO-5 P1).
- Dashboard counts (AD-1 deferred).

## References

- PRD AD-5, §5 order lifecycle
- `docs/SCHEMA.md` decisions 6 and 8
- Spec 0011 COD checkout
- Spec 0002 available stock rule
