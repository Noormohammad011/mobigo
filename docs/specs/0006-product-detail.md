# 0006 · Product detail page

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
Gallery interaction, variant URL shape, and which P-6 sections ship in the first build were not deliberated.

## Assumption built on
Route `/phones/[slug]` behind `product_detail`. Chosen variant in query `variant=<id>`. Color and storage chips pick an active variant; invalid pairs are disabled. Gallery follows the selected variant color images. Price, SKU, and quantity use live `getVariantAvailability`. Sticky mobile buy bar reads the same selection. Product JSON-LD with Offer. Related phones: same brand, up to 4. Key specs from grouped SpecValue rows when present; description from product HTML. Reviews and FAQ deferred per scope.

## Code area
`src/app/phones/[slug]/`, `src/lib/queries/product-detail.ts`, `src/components/product/`

## Requirements
- Picking colour and storage updates price, stock, SKU and gallery
- Unavailable combinations disabled
- Shareable URL with variant id
- Sticky buy bar knows the variant
- Valid Product JSON-LD

## Ratify
Run `/architect product detail page` to ratify. Does not block marking done.
