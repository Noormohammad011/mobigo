# Scope: MobiGo

A mobile first store that sells only phones in Bangladesh, paid by Cash on Delivery. It serves shoppers on a phone who want a genuine handset at a clear price, and the staff who confirm and deliver orders.

**Build approach:** Tracer Bullet (each feature runs end to end, database to page, before the next one starts; nothing faked).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`). Cart and COD checkout carry `· GA` because they touch orders, stock and money. `/architect` is the recommended first stop for a feature with a real decision, and you can skip it when you already know the build.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Stack & scaffold | Foundation | existing |
| B | Data model & migrations | Foundation | existing |
| C | Seed data | Foundation | existing |
| D | Design system | Foundation | existing |
| E | Global shell | Foundation | existing |
| F | Auth & account basics | Foundation | existing |
| G | Home page | Foundation | existing |
| 1 | Test setup | Foundation | in-progress |
| 2 | Feature flags | Foundation | in-progress |
| 3 | Analytics | Foundation | in-progress |
| 4 | Available stock rule | Slice 1: Browse | in-progress |
| 5 | Product listing | Slice 1: Browse | in-progress |
| 6 | Product detail page | Slice 1: Browse | in-progress |
| 7 | Search | Slice 1: Browse | in-progress |
| 8 | Sitemap & robots | Slice 1: Browse | in-progress |
| 9 | Recently viewed | Slice 2: Recently viewed | in-progress |
| 10 | Cart | Slice 3: Buy | in-progress |
| 11 | COD checkout | Slice 3: Buy | planned |
| 12 | Order tracking | Slice 3: Buy | planned |
| 13 | Order history | Slice 3: Buy | planned |
| 14 | Wishlist | Slice 4: Wishlist | planned |
| 15 | Full spec data | Slice 5: Compare | planned |
| 16 | New spec columns | Slice 5: Compare | planned |
| 17 | Compare | Slice 5: Compare | planned |
| 18 | Admin catalog | Slice 6: Operate | planned |
| 19 | Admin merchandising | Slice 6: Operate | planned |
| 20 | Admin orders | Slice 6: Operate | planned |
| 21 | Admin settings & content pages | Slice 6: Operate | planned |

## Already built

### A. Stack & scaffold · existing
Next.js 16 App Router with `cacheComponents`, React 19, TypeScript, pnpm, Prisma 7.10 on Postgres 17 (local docker, Supabase hosted). code in `./`, `AGENTS.md`

### B. Data model & migrations · existing
Full catalog, cart, order, wishlist and settings model with raw SQL CHECKs, search column and trigram index. code in `prisma/schema.prisma`, `prisma/migrations/`, `docs/SCHEMA.md`

### C. Seed data · existing
Local only seed: 6 brands, 30 phones with variants, colours and images, collections, banners, delivery zones, settings, outlets. Specs are not filled yet (see 15). code in `prisma/seed.ts`

### D. Design system · existing
Tailwind v4 tokens, shadcn (Base UI) components, commerce components (card, price, chips, stepper, phone input), showcase page. code in `src/app/globals.css`, `src/components/ui/`, `src/components/commerce/`, `docs/DESIGN_SYSTEM.md`

### E. Global shell · existing
Header, sticky search form, brand nav, footer, mobile bottom nav, WhatsApp button, skip link. Live search suggestions (G-5) are not built yet and belong to 7. code in `src/components/layout/`, `src/app/layout.tsx`

### F. Auth & account basics · existing
Supabase email and password sign up, sign in, confirm, reset; `/account` profile; session helpers and route guard. code in `src/app/auth/`, `src/app/account/`, `src/lib/auth/`, `src/proxy.ts`

### G. Home page · existing
Hero carousel, trust strip, brand grid, curated shelves with brand chips, budget tiles, SEO block, Organization JSON-LD. code in `src/app/page.tsx`, `src/components/home/`, `src/lib/queries/home.ts`

## Foundations

### 1. Test setup · in-progress
Unit and component tests plus browser end to end tests, so every later slice can be proven. Tests run against a real Postgres from the real migrations.
**Done when:** `pnpm test` and `pnpm test:e2e` run locally, one sample test passes in each, and an end to end test can open the home page against seeded data.
- [x] Design it (spec): `/architect test setup`
- [ ] Build it: `/develop test setup`
   - [x] Vitest unit and component projects with Next shims (AC-1, AC-5)
   - [x] Test database: rollback proxy, savepoints, guard, race project (AC-2, AC-3, AC-4, AC-10)
   - [x] Isolated e2e build: own build folder and port, local Supabase, env allowlist and hosted ref scan (AC-6, AC-9, AC-10, AC-11)
   - [x] E2E fixtures: axe scan, signed in worker users with cleanup (AC-7, AC-8)
- [ ] Verify it: `/check verify test setup`
- [ ] Test it: `/test test setup`
Spec [0001](../specs/0001-test-setup.md)
code in `vitest.config.ts`, `playwright.config.ts`, `scripts/e2e.ts`, `src/test/`

### 2. Feature flags · in-progress
One on/off flag per feature, so an unfinished or risky feature can ship dark and be switched on without a deploy.
**Done when:** every planned feature below has a named flag, a page or action behind an off flag is unreachable (404 or hidden), and flags can be read on the server.
- [ ] Design it (spec): `/architect feature flags`
- [x] Build it: `/develop feature flags`
- [ ] Verify it: `/check verify feature flags`
- [ ] Test it: `/test feature flags`
Spec [0003](../specs/0003-feature-flags.md)
assumed decision (spec 0003). code in `src/lib/flags.ts`

### 3. Analytics · in-progress
A privacy friendly analytics tool that records the agreed event list (page view, product view, add to cart, checkout start, order placed, plus any events added during design).
**Done when:** each agreed event fires once with its agreed properties, no personal data is sent, and events are visible in the tool's dashboard.
- [ ] Design it (spec): `/architect analytics`
- [ ] Build it: `/develop analytics`
- [ ] Verify it: `/check verify analytics`
- [ ] Test it: `/test analytics`
Spec [0004](../specs/0004-analytics.md)
assumed decision (spec 0004). code in `src/lib/analytics.ts`. The call exists and sends nothing until a provider is chosen.

## Slice 1: Browse

### 4. Available stock rule · in-progress
One shared rule for what a shopper can buy: stock minus reserved stock. Listing, product page, cart and checkout all read it from one place, so they never disagree.
**Done when:** one server read returns available stock per variant and per product, the quantity stepper uses that cap, and the seed sets the in stock flag with the same rule. The test that two shoppers cannot buy the last unit belongs to checkout.
- [x] Design it (spec): `/architect available stock rule`
- [ ] Build it: `/develop available stock rule`
   - [ ] Pure rule and unit tests (AC-2, AC-3, AC-4, AC-5, AC-11)
   - [ ] Server reads and database tests (AC-1, AC-5, AC-6, AC-7, AC-8, AC-10)
   - [x] Stepper and seed (AC-6, AC-9)
- [ ] Verify it: `/check verify available stock rule`
- [ ] Test it: `/test available stock rule`
Spec [0002](../specs/0002-available-stock-rule.md)
code in `src/lib/stock-rule.ts`, `src/lib/stock.ts`, `src/components/commerce/quantity-stepper.tsx`

### 5. Product listing · in-progress
`/phones`, `/brands/[slug]` and `/collections/[slug]` share one listing with filters, sort and pagination (PRD L-1 to L-7). Home budget tiles and shelf "View all" links land here.
**Done when:** filters and sort live in the URL and survive back and share; the grid matches L-2 at every breakpoint; "Load more" on mobile, numbered pages on desktop; empty state offers "Clear filters"; pages are server rendered with canonical URLs.
- [ ] Design it (spec): `/architect product listing`
- [x] Build it: `/develop product listing`
- [ ] Verify it: `/check verify product listing`
- [ ] Test it: `/test product listing`
Spec [0005](../specs/0005-product-listing.md)
assumed decision (spec 0005). code in `src/app/phones/page.tsx`, `src/app/brands/[slug]/page.tsx`, `src/app/collections/[slug]/page.tsx`

### 6. Product detail page · in-progress
`/phones/[slug]` with gallery per colour, price block, and a variant picker that exposes the chosen variant (to the buy buttons, the URL and the price) (PRD P-1 to P-6, P-9 related phones, P-11).
**Done when:** picking colour and storage updates price, stock, SKU and gallery; unavailable combinations are disabled; the chosen variant is shareable by URL; the sticky mobile buy bar knows the chosen variant; Product JSON-LD with offers is valid.
- [ ] Design it (spec): `/architect product detail page`
- [x] Build it: `/develop product detail page`
- [ ] Verify it: `/check verify product detail page`
- [ ] Test it: `/test product detail page`
Spec [0006](../specs/0006-product-detail.md)
assumed decision (spec 0006). code in `src/app/phones/[slug]/page.tsx`, `src/lib/queries/product-detail.ts`, `src/components/product/`

### 7. Search · in-progress
`/search?q=` results on the shared listing, plus live suggestions in the header search box (PRD G-5).
**Done when:** results rank by relevance with typo tolerance; suggestions show thumbnail, name and price after a 250ms pause; Enter goes to the results page; search still works without JavaScript.
- [ ] Design it (spec): `/architect search`
- [x] Build it: `/develop search`
- [ ] Verify it: `/check verify search`
- [ ] Test it: `/test search`
Spec [0007](../specs/0007-search.md)
assumed decision (spec 0007). code in `src/app/search/page.tsx`, `src/lib/queries/search.ts`, `src/components/layout/search-bar-with-suggestions.tsx`

### 8. Sitemap & robots · in-progress
`sitemap.xml` and `robots.txt` covering home, listings, brands, collections and every product page.
**Done when:** the sitemap lists every live product and brand URL with no noindex pages, and robots points to it.
- [x] Build it: `/develop sitemap & robots`
- [ ] Verify it: `/check verify sitemap & robots`
- [ ] Test it: `/test sitemap & robots`
code in `src/app/sitemap.ts`, `src/app/robots.ts`

## Slice 2: Recently viewed

### 9. Recently viewed · in-progress
A "Recently viewed" row on the product page only, kept in the browser, with no schema change.
**Done when:** the last few phones a shopper opened show on the product page (never the current one), it survives a reload, and an empty or broken store hides the row.
- [x] Build it: `/develop recently viewed`
- [ ] Verify it: `/check verify recently viewed`
- [ ] Test it: `/test recently viewed`
code in `src/lib/recently-viewed.ts`, `src/components/product/recently-viewed.tsx`

## Slice 3: Buy

Cart and checkout are built and shipped together.

### 10. Cart · in-progress · GA
`/cart` for guests and signed in shoppers. Guest cart merges into the server cart after sign in; each cart line stores the price the shopper saw; every line shows a clear status (ok, price changed, low stock, out of stock).
**Done when:** a guest cart merges on sign in without losing or doubling lines; a line whose price moved since it was added says so; quantity never exceeds available stock (4); totals match the server.
- [ ] Design it (spec): `/architect cart`
- [x] Build it: `/develop cart`
- [ ] Verify it: `/check verify cart`
- [ ] Test it: `/test cart`
Spec [0010](../specs/0010-cart.md)
assumed decision (spec 0010). code in `src/app/cart/`, `src/lib/cart/`, `src/components/cart/`

### 11. COD checkout · needs a decision · GA
`/checkout` with Cash on Delivery only (PRD CO-1 to CO-4, CO-6). Places a `PENDING` order, reserves stock in one transaction, caps the order size, and never drops anything from the order without telling the shopper.
**Done when:** a valid order reserves stock and shows the order number; prices and stock are read again on the server; an order over the cap is refused with a clear message; any line that changed or ran out is shown to the shopper before placing; max 3 pending orders per phone number.
- [ ] Design it (spec): `/architect COD checkout`

### 12. Order tracking · needs a decision
Public `/track` with order number plus phone, no sign in (PRD A-5).
**Done when:** the right number and phone pair shows the status timeline; a wrong pair reveals nothing about whether the order exists; lookups are rate limited.
- [ ] Design it (spec): `/architect order tracking`

### 13. Order history
Order list and order detail with a status timeline in `/account` (PRD A-2).
**Done when:** a signed in shopper sees only their own orders, newest first, and each detail shows items, totals and status history.
- [ ] Build it: `/develop order history`

## Slice 4: Wishlist

### 14. Wishlist
Signed in only, at `/account/wishlist`, with a heart on product cards and the product page.
**Done when:** a signed in shopper can save and remove phones and see them at `/account/wishlist`; a guest tapping the heart is sent to sign in and returns to the same phone.
- [ ] Build it: `/develop wishlist`

## Slice 5: Compare

Built in this order: data first, then columns, then the page.

### 15. Full spec data · needs a decision
Full spec sheets for all 30 phones in the seed, plus a backfill script that loads the same specs into the hosted database safely.
**Done when:** every seeded phone has every spec group filled; the backfill script can run twice with the same result, touches only spec rows, and refuses to run without an explicit target.
- [ ] Design it (spec): `/architect full spec data`

### 16. New spec columns · needs a decision
The two new spec columns agreed for Compare and filtering, added through a migration.
**Done when:** the migration applies cleanly, `pnpm db:drift` prints an empty migration, and the seed and backfill fill both columns.
- [ ] Design it (spec): `/architect new spec columns`

### 17. Compare · needs a decision
`/compare` for up to 3 phones (2 on mobile), grouped by spec group, with a "highlight differences" toggle and no "better" badges (PRD CP-1, CP-2, C-4).
**Done when:** the compare list persists in the browser, the floating "Compare (n)" pill appears when it is not empty, differences highlight on toggle, and no cell is labelled better or worse.
- [ ] Design it (spec): `/architect compare`

## Slice 6: Operate

### 18. Admin catalog · needs a decision
Role gated admin for brands and products: base info, specs, description, images per colour, variants with SKU, price, compare at price and stock (PRD AD-2, AD-3).
**Done when:** a staff user can create and edit a phone end to end and it appears on the store; non staff get no access; storefront caches refresh after a save.
- [ ] Design it (spec): `/architect admin catalog`

### 19. Admin merchandising
Collections (home shelves) and banners with ordering and schedule (PRD AD-4).
**Done when:** staff can reorder a shelf and schedule a banner, and the home page reflects it after save.
- [ ] Build it: `/develop admin merchandising`

### 20. Admin orders · needs a decision · GA
Order list with filters, detail, and status changes with notes, each written to status history; stock released on cancel and restocked on return (PRD AD-5).
**Done when:** every allowed status move works and is logged; disallowed moves are refused; reserved and real stock stay correct through cancel and return.
- [ ] Design it (spec): `/architect admin orders`

### 21. Admin settings & content pages
Delivery zones and fees, contact info, WhatsApp number, outlets (PRD AD-7), and the CMS pages: About, Contact, FAQ and the policies (PRD 4.11).
**Done when:** staff edits show in the footer and checkout fees; every footer policy link opens a real page.
- [ ] Build it: `/develop admin settings & content pages`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Reviews**: rating summary, write a review, moderation (P-7, AD-6) · needs a decision
- **Product FAQ** accordion (P-8)
- **Saved addresses** (A-3)
- **Order emails and SMS** (CO-5) · needs a decision
- **Admin dashboard** (AD-1)
- **Promo modal** (G-8)
- **Coupons** (CA-4) · needs a decision
- **Hosted CI for tests**: run `pnpm test` and `pnpm test:e2e` on every push once the repo has a git remote · from spec 0001

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` at spec capture | `Design it` ticked; spec linked; `Build it: /develop <feature>` + 2 to 5 milestones; the tier's closing boxes |
| `in-progress` (building) | `/develop` | milestone boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | you, when you decide it is; `/sync` reconciles | the tier's last stage is the suggested point to call it done |

- **Next step** = the first unticked box.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`.
- **Atomic build tasks live in the spec's `## Build plan`**, not here.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (built before this workflow) and `dropped` (de scoped, kept for history).
- **Workflow tier tag** beside a heading (e.g. `· GA`) sets that feature's rigor above the project default: GA adds a fresh model `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
