# Design Review: Phone listing (`/phones`)

Reviewed against: `docs/DESIGN_SYSTEM.md` (§6 layout, §7.4 ProductCard, §7.12 filters)  
Philosophy: Bright catalog inside dark chrome — flat display case, tone steps not shadow stacks  
Date: 2026-11-01

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-phones-desktop-1280.png` | Desktop (1280×800) | Filters + grid (historical capture) |
| `screenshots/review-phones-tablet-768.png` | Tablet (768×1024) | Stacked layout |
| `screenshots/review-phones-dropdowns-desktop-1280.png` | Desktop (1280×800) | FormSelect on listing filters |
| `screenshots/review-phones-mobile-grid-before-user.png` | Mobile (~412px, user) | Pre-fix two-column grid |
| `screenshots/review-phones-desktop-five-col-before-user.png` | Desktop (user) | Pre-fix five-column grid + sidebar scroll bleed |

> All screenshots are in `.design/phone-listing/screenshots/`.

## Summary

Listing cards and filters are on-brand (flat cards, grouped filters, custom selects). Two layout issues showed up in QA: **five columns on wide desktop** made cards unreadable, and the **filter panel scrolled as one block with the page**, so the scrollbar sat awkwardly beside the product grid. **Fixed:** **1 → 2 → 3** column grid (mobile / tablet / `lg+`), sticky sidebar on the `aside`, and an **inner scroll region** for filter groups only (`min-h-0` + `overflow-y-auto` + `scrollbar-gutter: stable`).

## Must Fix

1. **Five-column desktop grid**: `xl:grid-cols-5` crammed cards. See [`screenshots/review-phones-desktop-five-col-before-user.png`]. **Fixed:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-5` in `phone-listing.tsx` and matching skeleton.

2. **Two-column grid on small phones** (earlier). See [`screenshots/review-phones-mobile-grid-before-user.png`]. **Fixed:** single column below `md`.

3. **Filter sidebar scroll**: Whole `<section>` had `overflow-y-auto` while also `sticky` on a parent — scroll clipped against the grid. **Fixed:** sticky on `aside` (`top-28`, `self-start`); header/chips/sort stay fixed; filter groups scroll inside a nested pane.

## Should Fix

1. **Mobile filters**: Collapsible “Filters” on `< lg` helps, but PRD bottom-sheet drawer is still the long-term pattern.

2. **§6 doc vs product choice**: Design table lists up to 5 cols at `xl`; catalog intentionally caps at **3** for readability — note in DESIGN_SYSTEM when docs are next edited.

## Could Improve

1. Filter chips duplicated in a compact row above the grid on desktop (sidebar already shows chips).

2. Subtle fade at bottom of filter scroll pane when content overflows (optional affordance).

## What Works Well

- **Three-column desktop grid** gives each card room for price, save badge, and dual CTAs.
- **Sticky filter column** keeps sort/reset visible while scrolling filter groups.
- **Flat product cards** and **FormSelect** filters stay consistent with the rest of the store.

## Changes shipped (reference)

- `src/components/listing/phone-listing.tsx` — grid 1/2/3, sticky `aside`.
- `src/components/listing/listing-filter-form.tsx` — nested scroll for filter groups.
- `src/components/listing/phone-listing-fallback.tsx` — skeleton grid aligned.
- `src/components/commerce/product-card.tsx` — image `sizes` for 3-column desktop.
