# Verify: COD checkout · spec 0011 · updated 2026-10-31

_Steps derived from spec 0011 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] `GET http://localhost:3000/checkout` → 200, body includes "Cash on Delivery" → AC-1, AC-3
- [ ] Submit valid address → confirmation shows `MG-` order number → AC-4 (manual or e2e)
- [ ] Cart with preorder variant → place order shows line error → AC-3 (covered by db test for resolve)

## Commands

- [x] `pnpm test src/lib/orders/place-order.db.test.ts` → 4 passed → AC-3, AC-4, AC-5, AC-6, AC-7
- [x] `pnpm typecheck` → exit 0 → build health
- [x] `grep checkout_start` in `src/app/checkout/actions.ts` → AC-8

## Acceptance-criteria coverage

- AC-1 … UI checkout form and COD copy
- AC-2 … guest vs signed in line sources (code review + manual guest path)
- AC-3 … resolveCheckoutLines rejects non ok
- AC-4 … db test places order and reserves stock
- AC-5 … db test or manual cap (default 300000)
- AC-6 … db test pending limit
- AC-7 … db test reserve failure path
- AC-8 … analytics calls present in `placeOrderAction` (grep)
