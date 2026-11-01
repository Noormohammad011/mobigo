# Design Review: Compare page & global chrome

Reviewed against: `docs/DESIGN_SYSTEM.md` (no feature-local brief)
Philosophy: Dark ink header/footer, light catalog surfaces, flat commerce UI
Date: 2026-11-01

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-compare-before-fix-desktop-user.png` | Desktop (user) | Compare with one phone; duplicate theme control visible in header |
| `screenshots/review-compare-before-fix-footer-duplicate-theme-user.png` | Desktop dark (user) | Footer bar showing second theme switcher |

> Automated full-page captures timed out in the IDE browser; user-supplied screenshots document the pre-fix state. Re-verify locally after pull.

## Summary

Compare removal failed when the last phone was cleared because the UI kept falling back to URL `?slugs=` after localStorage was emptied. Theme switching appeared twice on long pages because the same control lived in the header and footer. Both are fixed in code; theme now lives in the header (desktop) and mobile menu only.

## Must Fix

1. **Last compare item could not be removed**: `CompareView` used `storedSlugs.length > 0 ? storedSlugs : initialSlugs`, so an empty list re-read slugs from the URL. _Fix: trust localStorage once initialized (`isCompareListInitialized`) and `router.replace("/compare")` when the list is empty._ Files: `src/lib/compare/compare-list.ts`, `src/components/compare/compare-view.tsx`.

2. **Duplicate theme switcher**: Header and footer both rendered `ThemeSwitcher`. _Fix: remove footer instance; keep header (`lg+`) and mobile menu._ File: `src/components/layout/footer.tsx`.

## Should Fix

1. **Compare URL vs localStorage on first visit**: Shared links with `?slugs=` still work when localStorage has never been written; consider seeding localStorage once for consistency. See `compare-view.tsx` slug resolution.

2. **Compare table horizontal scroll on small viewports**: `min-w-[640px]` is intentional but worth a sticky first column in a follow-up. See user desktop screenshot.

## Could Improve

1. **Empty compare state**: When all slots are empty, emphasize “Browse phones” and hide the spec table shell earlier for less visual noise.

2. **Remove control discoverability**: Ensure “Remove” stays in the tab order and is labeled for screen readers (button text is fine; verify after hydration).

## What Works Well

- Side-by-side slot search plus product header row matches a familiar compare pattern.
- Spec grouping and optional “Highlight differences” support scanning.
- Single header theme control (light / dark / system) aligns with DESIGN_SYSTEM inverse tone on ink chrome.
