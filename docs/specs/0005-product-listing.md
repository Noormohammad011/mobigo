# 0005 · Product listing

**Status**: Assumed
**Date**: 2026-10-31
**Authorized by**: you, during /develop

## Owed decision
The listing filter URL, the sort names, and how "load more" behaves were not deliberated. This build follows the scope done when line and PRD L-1 to L-7 as the working assumption.

## Assumption built on
`/phones`, `/brands/[slug]`, and `/collections/[slug]` share one server rendered listing. Filters and sort live in the query string: brand, min, max, ram, storage, network (4g or 5g), display (under6, 6to65, over65), battery (under4000, 4000to5000, over5000), chipset, availability (in_stock or preorder), sort (relevance, newest, price_asc, price_desc, saving), and page. Page size is 20. Relevance with no search term sorts by name. Desktop shows numbered pages. Smaller screens show a Load more link to the next page (it opens that page, it does not append in place). An empty result offers Clear filters. The page is behind the `product_listing` flag. Cards reuse the home product card, whose in stock flag is the stored column.

## Code area
`src/app/phones/page.tsx`, `src/app/brands/[slug]/page.tsx`, `src/app/collections/[slug]/page.tsx`, `src/components/listing/phone-listing.tsx`, `src/lib/listing-params.ts`, `src/lib/queries/listing.ts`.

## Requirements
- Filters and sort survive in the URL.
- The grid is 2, 3, 4, then 5 columns at the breakpoints in the PRD.
- Empty state offers Clear filters.
- Pages are server rendered and expose a canonical URL.

## Ratify
This decision was recorded by /develop, not deliberated. Run `/architect product listing` to deliberate and ratify it. Until then it stays flagged as an owed decision. It does not block marking the feature done.
