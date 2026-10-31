# 0014 · Wishlist

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
None beyond PRD and SCHEMA.

## Assumption built on
Signed in only. `WishlistItem` rows. `/account/wishlist` lists saved phones. Heart toggle on product cards and PDP; guest heart links to sign in with `next` back to the product. Flag `wishlist`.

## Code area
`src/app/account/wishlist/`, `src/components/wishlist/`, `src/app/wishlist/actions.ts`

## Requirements
- PRD A-4 save and remove; guest sent to sign in

## Ratify
Run `/architect wishlist` to ratify if needed.

## Build plan
- [x] Server actions and wishlist page
- [x] Heart button on card and PDP
