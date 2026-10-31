# 0012 · Order tracking

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
Rate limit storage was not deliberated.

## Assumption built on
Public `/track` behind `order_tracking`. Form: order number plus phone. Match on `Order.orderNumber` and `Order.customerPhone` (normalized). Wrong pair returns the same generic message with no existence leak. Status timeline from `OrderStatusHistory` plus current status. Rate limit: 15 failed lookups per client IP per hour in process memory (ponytail: single instance dev; replace with Redis or DB for multi instance).

## Code area
`src/app/track/`, `src/lib/rate-limit/`

## Requirements
- PRD A-5 public track without login
- Rate limited lookups

## Ratify
Run `/architect order tracking` to ratify.

## Build plan
- [x] Track lookup action and rate limit helper
- [x] Track page UI
