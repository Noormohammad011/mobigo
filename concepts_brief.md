# MobiGo Shopping Features: Cart, Compare, Wishlist, Recently Viewed
* **Author:** noor.mohammad (MobiGo)
* **Date:** 2026-10-31

## Overview

The proposal adds four shopping features right after milestone M1, which delivers the product listing and product detail pages:

1. **Cart.** A guest cart in localStorage that moves to a server cart on sign-in. Price and stock are rechecked each time the cart opens. Price changes are shown with a note. Sold-out lines stay visible and are skipped at checkout. The limit is 5 of each variant.
2. **Compare.** Up to 3 phones side by side (2 on phones), grouped by spec section, with a "show only differences" switch. It needs key specs stored as numbers so differences and "better" can be computed.
3. **Wishlist.** Signed-in shoppers can save phones. Guests are asked to sign in.
4. **Recently viewed.** The last 10 phones opened, stored in the browser and shown on the product page and the home page.

Six reviewers looked at the concept against the PRD, SCHEMA.md, the live Prisma schema, the seed, and the existing code: design, codebase details, zoom-out, comprehension, implementation readiness, and structure. They agreed the direction makes sense, but the concept is not ready to draft as written. Their reasons:

- It changes the PRD release plan without saying so.
- Compare has no spec data behind it.
- "One schema change" undercounts the work.
- The cart rules leave the risky cases undefined: merge, pre-orders, partial stock, deleted variants, and skipping lines at checkout.
- None of the success measures can be measured with what exists today.

Sources checked: `/home/noor/Desktop/Mobigo/docs/PRD.md`, `/home/noor/Desktop/Mobigo/docs/SCHEMA.md`, `/home/noor/Desktop/Mobigo/prisma/schema.prisma`, `/home/noor/Desktop/Mobigo/prisma/seed.ts`, `/home/noor/Desktop/Mobigo/AGENTS.md`, `/home/noor/Desktop/Mobigo/docs/DESIGN_SYSTEM.md`, and files under `/home/noor/Desktop/Mobigo/src/`.

## Analysis

Findings were merged across the six lenses. Lens names: design, codebase, zoom-out, comprehension, readiness, structural. One conflict between reviewers was checked by hand. The structural lens said the 30 seeded phones already have spec rows. They do not: `prisma/seed.ts` only runs `db.specValue.deleteMany()` (line 187) and never creates SpecGroup, SpecAttribute or SpecValue rows.

### 🔴 Blockers

**B1. The concept changes the PRD release plan without saying so, and leaves checkout out.** (all six lenses)
- PRD §9 puts Cart in M2 alongside COD checkout, and Compare and Wishlist in M4 "Polish". Compare, Wishlist and Recently Viewed are P1 (CP-1, CP-2, A-4, P-9). Cart is P0 (CA-1..3).
- Building all four "right after M1" puts two P1 features ahead of checkout (M2) and admin (M3).
- Several cart behaviours, such as "checkout skips sold-out items" and the add-to-cart-to-order measure, depend on a checkout that does not exist yet.
- AGENTS.md names PRD.md as the source of truth for scope, so the brief must either amend PRD §9 or follow it.

**B2. Compare has no spec data to show.** (codebase, zoom-out, design, readiness)
- The seed creates no spec rows (seed.ts:187), so a "grouped by spec section" table would be empty for all 30 phones. The PRD P-6 spec sheet on the product page has the same problem, which puts this on M1's path too.
- The admin spec editor (AD-3) is in M3. The seed refuses hosted hosts (seed.ts:26-29), so no path exists today to put specs into production.
- The seed type has no camera MP or refresh rate field, so a backfill has nothing to parse from.

**B3. "One schema change" is wrong. At least three changes are needed.** (codebase, structural, comprehension, design, readiness)
- **Price baseline for the cart note.** "Price dropped by ৳2,000" needs a stored earlier price. CartItem (schema.prisma:381-394) has no price column, so signed-in carts cannot show the note.
- **Numeric spec storage.** The concept does not say where the numbers would live.
- **A "better" direction for each attribute.** SpecAttribute has isKeySpec and isComparable but nothing that says whether higher or lower is better.
- Part of the numeric work already exists. Product has `displaySizeIn`, `batteryMah`, `chipsetBrand`, `ramOptionsGb` and `storageOptionsGb` (schema.prisma:146-151), each with an update path under SCHEMA decision 9. The genuinely missing pieces are main camera MP and refresh rate.
- SCHEMA decision 3 calls the EAV "display-only". Computing "better" from it means amending that decision.

**B4. Pre-order phones would be marked sold out and dropped at checkout.** (codebase, design, readiness, comprehension)
- The seed gives PREORDER products stock 0 (seed.ts:214). The product card still sells them with a "Pre-order" button (product-card.tsx:27, 84).
- The concept's rule ("sold out stays visible, checkout skips it") would silently drop every pre-order. The two seeded pre-orders are POCO X8 Pro and Pixel 10a.
- The `variant_stock_ok` CHECK (reservedStock <= stock) blocks reserving stock at zero, so pre-orders cannot use the normal reservation path.

**B5. Cart merge on sign-in is not defined.** (all six lenses)
- Questions with no answer yet:
  - When the same variant is in both carts, are the quantities added or is the larger one kept?
  - What happens when the merged quantity goes over 5 or over available stock?
  - When is localStorage cleared?
  - What happens on sign-out on a shared family phone?
- The `cart_qty_range` CHECK (quantity 1..5) makes a naive merge fail the whole transaction.
- There are three sign-in entry points: signIn (actions.ts:58-68), signUp with an immediate session (actions.ts:50), and /auth/confirm (confirm/route.ts:24). All three run on the server, and none can read localStorage. The merge therefore has to start in the browser after sign-in.
- The email-confirm link often opens in an in-app browser or on another device, where the guest cart does not exist.
- A retried or two-tab merge must not double the quantities.

**B6. "Available", "sold out" and the line states are not defined.** (all six lenses)
- The concept says "stock". The correct figure is `stock - reservedStock` (SCHEMA decision 6).
- Cases with no defined behaviour:
  - Partial stock: the cart holds 4 and 2 are left.
  - An inactive variant.
  - A DRAFT or DISCONTINUED product.
  - A deleted variant. `onDelete: Cascade` on CartItem (schema.prisma:390) makes server lines vanish silently, while guest lines keep a dead ID. Every reseed recreates all IDs (seed.ts:182-193).
- QuantityStepper floors its maximum at 1 even when stock is 0 (quantity-stepper.tsx:21).

**B7. "Checkout skips it" changes the order without the shopper agreeing.** (zoom-out, comprehension, design, codebase, structural)
- In a COD shop, a missing phone is discovered on the staff phone call or at the door. That leads to refused deliveries and wasted courier fees.
- Stock can also sell out between the cart check and Place Order, when the reservation update returns 0 rows (SCHEMA §4.6). The concept does not say whether the order then fails or goes through partly.
- Buy Now (P-5) skips the cart. The concept does not say whether it follows the same rules.

**B8. No shared, versioned client-storage contract.** (structural, readiness)
- Three features keep state in localStorage. Without one contract, each will invent its own keys and formats.
- A later format change would then break returning shoppers' carts, and tampered data could reach server actions.

**B9. No test tooling exists.** (readiness)
- package.json has no test script and no runner. SCHEMA.md asks for constraint tests against real Postgres, but nothing can run them.
- Merge, re-validation and compare-difference logic need tests before they ship.

### 🟡 Major

**M1. The success measures cannot be measured.** (all six lenses)
- No analytics package is installed. PRD §6 lists analytics events but names no tool.
- "Product views that end in add-to-cart" has no baseline, because the product pages do not exist yet.
- "Compare sessions that lead to an order" needs a session-to-order link. Compare state is client-only, and Order has no attribution field.
- "Fewer WhatsApp questions" has no data source and no pre-launch baseline.

**M2. Compare may not address the WhatsApp question.** (zoom-out)
- Bangladeshi COD shoppers mostly use WhatsApp for trust and price questions: official or unofficial, real warranty, stock at the outlet, a better price. A spec table answers none of these.
- Cheaper options that target the real question:
  - A prefilled "Ask on WhatsApp" link carrying the product, variant and URL (PRD P-10; `src/components/layout/whatsapp-button.tsx` already exists).
  - Curated "X vs Y price in Bangladesh" pages, which also serve the SEO goal.

**M3. A computed "better" can mislead shoppers.** (design, zoom-out, comprehension, codebase, structural)
- Chipset is a name, not a number. Ranking chipsets needs a benchmark table that someone keeps up to date.
- Camera MP is a poor quality signal: a 200MP mid-range phone would beat a flagship.
- Screen size is a preference, not a "better".
- A wrong badge creates the very questions and complaints the feature is meant to reduce.

**M4. Compare at product level or variant level?** (all lenses)
- RAM, storage and price belong to each variant (ProductVariant.ramGb, storageGb, price). A phone has no single value for them.
- The card compare toggle (C-4) has no variant context.

**M5. "Show only differences" conflicts with the PRD.** (codebase, structural, comprehension, design)
- PRD CP-1 says "highlight differences", which keeps all rows and styles the ones that differ. The concept's "show only differences" hides rows.
- The concept also leaves out CP-2: the compare list stored in localStorage and a floating "Compare (n)" pill.

**M6. Per-user UI would break the cached pages.** (design, codebase, readiness, structural)
- Header, home shelves and ProductCard are cached server output (home.ts:89-117; page.tsx:19-22).
- Reading the cart count, wishlist hearts or recently viewed on the server would make every page dynamic and add an auth and DB call per request.
- These must be client islands with reserved space, to keep CLS under 0.1 and the listing JS budget (PRD §6).
- CartLink already takes a `count` prop that nothing passes (cart-link.tsx:9).

**M7. The cart recheck must not use the cached catalog queries.** (codebase, design)
- Catalog reads use `cacheLife("minutes")` and the "products" tag (home.ts:90-92).
- A shopper could see one price on the product page and a "price changed" note seconds later in the cart.
- Variant price and stock writes must revalidate the "products" tag, and the cart and checkout reads must be uncached.

**M8. RLS does not protect cart and wishlist actions.** (design, readiness)
- Prisma connects as the table owner and bypasses RLS (SCHEMA §8). Every server action is a public endpoint and must check ownership itself.
- Risks:
  - Changing another shopper's cartItem by passing its ID (IDOR).
  - Very large merge payloads.
- Any new table also needs `ENABLE ROW LEVEL SECURITY` (AGENTS.md).

**M9. The 5-per-variant cap does not limit order size.** (design, zoom-out)
- A shopper can add 5 units of each of several variants of one flagship. Fake COD orders then tie up reservedStock.
- CO-6 limits pending orders per phone number, not units per order.

**M10. A sign-in wall for the wishlist will see little use in this market.** (zoom-out, design, comprehension)
- Sign-up is email, password and email confirmation. Phone OTP is only P1, and many shoppers do not check email.
- With 30 phones, there is little reason to save one.
- If the wishlist is kept, the save must finish by itself after sign-in, using `next` and safeNextPath.
- WishlistItem is keyed per product (schema.prisma:357-367), so a variant picked on the product page is not remembered.

**M11. Recently viewed on the home page is new scope with layout-shift risk.** (zoom-out, structural, codebase, readiness)
- PRD P-9 places it on the product page only.
- On the cached home page it would appear after hydration and shift the layout. It is also empty for first-time visitors.
- No query exists to fetch fresh card data for a list of IDs.

**M12. Price changes are only covered for drops.** (comprehension, zoom-out, readiness)
- Price rises matter more for COD refusals and need their own copy.
- Also undefined: per unit or per line, when the note clears, and what happens when compareAtPrice changes.

**M13. Compare layout on small screens.** (comprehension, readiness, codebase)
- Not defined:
  - What happens when 3 phones were added on desktop and the page is opened on a phone.
  - Which breakpoint switches from 3 columns to 2.
  - Missing values.
  - The no-horizontal-scroll rule at 360px.
  - Stacking of the Compare pill, the WhatsApp button (z-float 55) and the sticky buy bar (z-bar 50).

**M14. No feature flag or rollback plan.** (readiness)
- There is no way to switch off one feature without a deploy.

**M15. Spec structure is missing.** (structural)
- The concept has no problem statement, alternatives, risks or rollout section, and no per-feature non-goals.
- It repeats existing PRD and SCHEMA rules without citing their IDs. Examples: CA-2, CA-3, P-4, and the `cart_qty_range` CHECK.

**M16. Accessibility is not stated.** (comprehension)
- Compare needs a real `<table>` with row and column headers.
- Cart changes must be announced through aria-live.
- Sold-out lines must be marked in text, not only by dimming.
- Hearts and compare toggles need aria-pressed and a label that includes the product name.
- Targets must be at least 44px, which is tight on a card about 164px wide.

### 🟢 Nits

- **N1.** Reuse what exists:
  - QuantityStepper (already capped at 5)
  - `formatBDT` (`src/lib/format.ts`)
  - sonner toasts
  - Badge `out` and the image dimming
  - SpecAttribute.isKeySpec and isComparable
  - SpecTable (DESIGN_SYSTEM §7.11)
  - `requireUser` and `safeNextPath`

  Restate "max 5" as a reference to P-4 and `cart_qty_range`, not as a new rule. (codebase, zoom-out, structural)
- **N2.** Docs have drifted apart:
  - The PRD says Next.js 15; AGENTS.md says 16.
  - PRD M0 says 5 brands; the seed has 6.
  - SCHEMA.md says Postgres 16; AGENTS.md says 17.
  - The seed has 3 delivery zones; the PRD names 2.

  New specs should cite AGENTS.md for stack facts. (codebase, structural, readiness)
- **N3.** The cart badge should count units of available lines. Cart lines should use the OrderItem `variantLabel` format "Black · 12GB/256GB · Official". (comprehension, readiness)
- **N4.** PRD CA-1 asks for a delivery-fee estimate in the cart before an address exists. Show "Delivery from ৳X" using the lowest active zone fee. (readiness)
- **N5.** Pick one term each and use it everywhere: "Recently viewed" vs "opened", and "From ৳X" vs a price range. (comprehension)
- **N6.** Keep en-US grouping through formatBDT for now. Keep feature copy in one module so the phase-2 Bangla work is a swap. (comprehension)
- **N7.** Shareable compare links are listed as out of scope, but they cost almost nothing if the compare page reads product slugs from the URL. They also match how people ask "which is better" on WhatsApp. (zoom-out, design)

### Strongest counter-arguments

- A phone shop's basket usually holds one item. Buy Now to COD checkout is the main conversion path, so Cart, Compare and Wishlist are all secondary to finishing checkout.
- WhatsApp questions are mostly about trust, warranty and price, not specs. Compare targets a different problem.
- As written, Compare has no data, its "better" has no reliable ranking, and nothing measures it. It could not succeed, and it could not be shown to fail.
- "Each feature attaches to the product page" is a reason to leave slots for them on the product page. It is not a reason to build all four together.

### What the proposal is not seeing

- Checkout (M2) and admin (M3) come before most of these features in the PRD.
- Pre-orders have stock 0.
- Deleted variants cascade out of server carts.
- Sign-in happens on the server, where localStorage cannot be read.
- Cached pages cannot hold per-user state.
- RLS does not cover Prisma.
- No analytics tool or test runner exists.

## Goals vs. Non-Goals

**Goals (as recommended by the reviewers)**
- A cart that never changes the order without telling the shopper. It rechecks price and `stock - reservedStock` on the `/cart` page and again at Place Order, and shows price drops and rises.
- Guest-to-account cart merge that is safe to retry, enforces the 5-unit cap, and keeps the guest cart until the server confirms the merge.
- One availability rule shared by the product page, cart and checkout.
- Per-user UI (cart badge, hearts, recently viewed) built as client islands that keep the cached pages unchanged and CLS under 0.1.
- A compare view that shows differences honestly, from real spec data, with no misleading "winner".
- Measurable outcomes: an analytics tool chosen, events defined, and baselines taken before targets are set.

**Non-Goals (for this round)**
- Coupons, back-in-stock alerts, price-drop alerts, and guest carts synced across devices (from the concept).
- A guest wishlist in localStorage.
- Ranking chipsets or using camera MP as a "better" signal.
- A mini-cart drawer. The cart is the `/cart` page only.
- The card quick variant picker (PRD C-3). The card keeps linking to `#buy` on the product page.
- Pre-orders in the cart (recommended). Pre-orders go through Buy Now or WhatsApp.
- Bangla copy and Bangla numerals (PRD §2 phase 2).
- Recently viewed on the home page (recommended to drop or defer).

## Key Decisions & Staging for Next Steps

These must be settled before `/egm-draft`. The reviewers' recommended answer follows each decision.

| # | Decision | Recommended answer |
|---|---|---|
| 1 | Milestone placement | Follow the PRD unless it is amended explicitly. Cart is designed and built with COD checkout in M2. Recently Viewed stays in M1 on the product page (P-9). Compare and Wishlist get their own later spec, after spec data exists. If the order changes, edit PRD §9 in the same change. |
| 2 | Document split | Three documents: (a) a short umbrella brief with the problem, measures, sequencing, client-storage contract and analytics events, plus the small Wishlist and Recently Viewed sections; (b) a Cart + Checkout spec; (c) a Compare spec that includes the schema change. Each cites PRD IDs and lists only what it adds or changes. |
| 3 | Availability rule | `available = max(0, stock - reservedStock)` for active variants of ACTIVE products, in one shared function used by the product page, cart and checkout. Pre-orders are not allowed in the cart in this round. |
| 4 | Cart line states | `ok`, `price_changed`, `qty_reduced` (lowered to available, with a note), `sold_out` (shown, left out of the subtotal), and `unavailable` (inactive, draft, discontinued or deleted: shown as "No longer available" with a Remove button). One uncached server function returns this status for every line. |
| 5 | Sold out at Place Order | Never skip a line silently. Unavailable lines appear under "Won't be ordered" in the cart and the checkout summary. If availability changes after the last check, Place Order stops and returns the shopper to a rechecked cart. Buy Now is a one-item checkout that leaves the cart alone but uses the same checks. |
| 6 | Price baseline | Add `CartItem.unitPriceSeen Int?` and store the same field in the guest cart. Show the difference per unit, with separate copy for drops and rises. Reset the baseline after it has been shown once. Checkout always charges the current DB price. |
| 7 | Merge rule | The reviewers split here. Most lenses recommend adding the two quantities, capped at min(5, available), and protected against double merges by a lock or merge ID. The design lens recommends keeping the larger quantity, capped the same way, because that is safe to retry with no lock and fits one-phone purchases. **Recommended: keep the larger quantity, capped at min(5, available).** The merge runs as one zod-validated server action called by a client CartSync component after any sign-in. It drops unknown or inactive IDs, clears localStorage only after success, and shows one toast. On sign-out the browser starts an empty guest cart. |
| 8 | Cart-level limit | Add a server-enforced cap per order, for example 5 units total, alongside CO-6. |
| 9 | Client storage contract | Versioned keys `mg.cart.v1`, `mg.compare.v1` and `mg.recent.v1`, holding IDs and quantities (plus the cart price baseline) only. Validated with zod on read; discarded on failure; in-memory fallback when storage is unavailable; tabs synced through the `storage` event. |
| 10 | Spec data source | Extend the seed with full key specs for all 30 phones, writing SpecGroup, SpecAttribute and SpecValue rows. Add an idempotent, slug-keyed backfill script for hosted Supabase. Track AD-3 (admin) as the long-term entry path. No Compare work starts before this. |
| 11 | Numeric spec storage | Add `SpecValue.numericValue Decimal?` and `SpecAttribute.betterWhen` (HIGHER / LOWER / NONE, default NONE). Keep the existing Product filter columns for listings and copy values into them under SCHEMA decision 9. Amend SCHEMA decisions 3 and 9. Migrations are additive only, with `pnpm db:drift` empty. |
| 12 | "Better" badges | None in the first release; show differences only. If kept, set HIGHER only for battery mAh, refresh rate, and max RAM and storage. Chipset, camera MP and screen size stay NONE. Missing values never win, and ties are not highlighted. |
| 13 | Compare unit and layout | Product level. RAM and storage show as option lists, price as "From ৳X". Store up to 3 on any device. Below md, show 2 columns with a switcher for the other. Adding past the cap offers "Replace...". Hide identical rows behind a switch (role="switch") while keeping group headers, and amend PRD CP-1 to match. Use the URL for the page (which also gives shareable links) and localStorage only for the "Compare (n)" pill. Mark the page noindex. Define how the pill, the WhatsApp button and the buy bar stack. |
| 14 | Wishlist | Either cut it from this round (zoom-out lens) or keep it per product, signed-in only. If kept: guest taps go to sign-in with `next=...?wish=1` through safeNextPath, the save finishes after sign-in, and the list lives at `/account/wishlist`. Decide which before drafting. |
| 15 | Recently viewed | Product page only, below the fold, product IDs only, newest first, deduplicated, max 10. Exclude the current product. Fetch fresh cards through one uncached `getProductCards(ids)` that reuses the `sellable` filter. Hide when fewer than 2. Include a Clear link. Leave it off the home page for now. |
| 16 | Per-user UI and caching | The cart badge (counting units of available lines), wishlist hearts, compare toggle and recently viewed are all client islands. Cart and checkout reads are uncached. Price and stock writes revalidate the "products" tag. |
| 17 | Security | Every action resolves the cart from the session and never accepts a cartId from the client. Zod validation: quantity 1..5, at most 20 lines per payload. Rate-limit merge and add-to-cart. Any new table gets RLS enabled. |
| 18 | Analytics and measures | Choose one privacy-friendly tool. Events: product_view, add_to_cart{variantId, source}, checkout_start, order_placed, cart_revalidated, compare_add, compare_view, wishlist_add, recent_click, whatsapp_click{productId}. Take a 30-day add-to-cart baseline after M1 before setting targets. Replace "compare sessions that lead to an order" with add-to-cart from the compare page, or with a sessionStorage `fromCompare` flag sent at checkout. Replace "fewer WhatsApp questions" with WhatsApp link clicks plus 2 weeks of staff-tagged chats before and after launch. |
| 19 | Cheaper WhatsApp fix first | Ship the prefilled product-context "Ask on WhatsApp" link (P-10) before interactive Compare, then decide whether Compare is still needed. |
| 20 | Tests and rollout | Add Vitest for logic and for DB tests against local Postgres, and Playwright for e2e at 360px and 1280px. Cover merge, each line state, compare differences, recently viewed, corrupt storage, the qty-6 CHECK, and guest-to-sign-in merge. Add one Setting-table flag per feature as a kill switch. |
