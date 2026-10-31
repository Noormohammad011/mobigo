# 0013 · Order history

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
None beyond PRD and SCHEMA.

## Assumption built on
Signed in shoppers see `/account/orders` (newest first) and `/account/orders/[id]` with items, totals, and status history. Only rows where `Order.userId` matches session. Behind `order_history`.

## Code area
`src/app/account/orders/`

## Requirements
- PRD A-2 order list and detail with timeline

## Ratify
Run `/architect order history` to ratify if needed.

## Build plan
- [x] Orders list page
- [x] Order detail page
