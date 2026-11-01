---
target: src/app/phones/[slug]
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/home/noor/Desktop/Mobigo/src/app/phones/[slug]"
timestamp: 2026-11-01T06-57-37Z
slug: src-app-phones-slug
---
Method: dual-agent (A: design review · B: detector). Browser extension not connected for either; A used source + SSR HTML, B used static + headless URL scans. No in-page overlay.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 1 | No stock/availability line; price not aria-live; no add-to-cart feedback |
| 2 | Match System / Real World | 2 | "256GB / 12GB" ambiguous; key specs lose group names; no "(Cash price)" |
| 3 | User Control and Freedom | 2 | Add to cart force-navigates to /cart |
| 4 | Consistency and Standards | 1 | Buy/Cart roles inverted vs spec; hand-rolled chips; "Buy now" vs "Buy Now" |
| 5 | Error Prevention | 1 | Buy now goes to /cart without adding; impossible RAM×storage combos listed |
| 6 | Recognition Rather Than Recall | 2 | Faint selected state, no swatch ring |
| 7 | Flexibility and Efficiency | 2 | No radiogroup arrow keys; thumbnails inert |
| 8 | Aesthetic and Minimalist Design | 2 | SKU weighted like Delivery; price undersized under H1 |
| 9 | Error Recovery | 1 | Failed addToCartAction is silent |
| 10 | Help and Documentation | 1 | No WhatsApp, COD, or confirmation-call reassurance near CTAs |
| **Total** | | **15/40** | **Poor** |

## Design Specificity
Category-interchangeable. Phone-specialist depth (grouped full spec sheet P-6, official vs unofficial) absent. Detector: 0 static findings (regex-only on .tsx, undercount); URL scan 1x overused-font (Inter, false positive, specified body face).

## Priority Issues
- [P0] Buy now is a Link to /cart that adds nothing; roles inverted (Add to cart filled, Buy now outline). product-purchase.tsx:211-223. Fix: Buy Now primary = add + /checkout; Add to cart outline, stays on page with toast; sticky bar size lg. -> harden/polish
- [P0] Sticky buy bar stacks above BottomNav (bottom-16 + always-rendered nav), ~130px chrome at 360px, page end hidden. Fix: hide BottomNav on /phones/*, bar bottom-0, reserve padding. -> adapt
- [P1] warrantyType never selected (product-detail.ts) and selectCombo ignores it; unofficial variants unreachable. Fix: Warranty chip row with per-variant price. -> shape/harden
- [P1] Decision point lacks PriceBlock (price-lg, Cash price, aria-live), stock line, COD/confirm-call/WhatsApp trust row. -> clarify/typeset
- [P1] Variant chips: cartesian RAM×storage grid, native disabled (unfocusable, no tooltip), no radiogroup semantics, color switch resets storage. -> harden

## Persona Red Flags
Casey: stacked fixed bars, text-only loading fallback (CLS), inert thumbnails, forced nav to cart. Riley: unreachable unofficial SKU, 9-chip grid, long H1 shares row with 40px icon buttons, silent add failure, pre-order without ship date. Jordan: RAM/storage order unclear, SKU code in purchase area. Karim: no "we call to confirm"/COD near CTA, buried warranty, Buy now lands on possibly empty cart.

## Minor
Colour/Color spelling; delivery fees missing; spec dl no stacking/overline; no breadcrumb; description muted not Body Ink; "More from Samsung" not price-band peers; no 5G/NEW badges on PDP; JSON-LD missing image/compare-at; bg-primary/10 instead of tint token.
