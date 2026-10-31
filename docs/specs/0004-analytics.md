# 0004 · Analytics

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
Which privacy friendly analytics tool receives the events, and the exact properties for each event.

## Assumption built on
`src/lib/analytics.ts` names the events from the scope: page view, product view, add to cart, checkout start, and order placed. The types accept no email, phone, or name. `track` does not send anything yet, because no provider was chosen. The listing pages call page view with the path only.

## Code area
`src/lib/analytics.ts` and the listing pages that call `track`.

## Requirements
- Each agreed event has a typed call.
- No personal data is in the payload.
- A dashboard is not wired until the provider is chosen.

## Ratify
This decision was recorded by /develop, not deliberated. Run `/architect analytics` to deliberate and ratify it. Until then it stays flagged as an owed decision. It does not block marking the feature done.
