# 0007 · Search

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
Ranking tweaks and suggestion count were not deliberated.

## Assumption built on
`/search?q=` reuses the phone listing with product ids from Postgres `websearch_to_tsquery` on the `search` tsvector column, trigram fallback on name when FTS returns nothing. Sort relevance uses search rank when `q` is set. Live suggestions: GET `/api/search/suggestions?q=` after 250ms debounce, max 8 rows with thumbnail, name, price. Header keeps a GET form for no JS. Flag `search`.

## Code area
`src/app/search/page.tsx`, `src/lib/queries/search.ts`, `src/app/api/search/suggestions/route.ts`, `src/components/layout/search-bar-with-suggestions.tsx`

## Requirements
- Results with typo tolerance via FTS and trigram fallback
- Suggestions after 250ms pause
- Enter goes to results page
- Works without JavaScript via form submit

## Ratify
Run `/architect search` to ratify.
