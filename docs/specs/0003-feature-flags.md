# 0003. Feature flags: plain on/off switches in the Setting table

**Date**: 2026-10-31
**Status**: In Progress

## Summary

Each visible feature gets one on/off switch (a feature flag), so unfinished work can ship hidden and be turned on without a deploy. The list of flag names lives in one TypeScript file. Their values live in one row of the existing `Setting` table, and a missing or unreadable value always means off. An off feature returns a normal 404, its entry links disappear, and its server actions refuse to run. When buying is off, shoppers get an "Order on WhatsApp" button instead. This spec ratifies the assumption `/develop` built on and lists the changes still needed.

## Context

The scope wants unfinished features to ship dark (hidden) and turn on later without a redeploy. Several features are being built at once by more than one session, and some (cart, checkout) touch orders and stock, so a way to switch one off quickly in an incident matters too.

The app uses Next.js 16 with `cacheComponents`. Most pages are prerendered from `"use cache"` reads and refreshed on a timer. Anything that reads per visitor data (cookies, the session) makes a page dynamic and slower, so a flag check must not need visitor data. The `Setting` table already holds store switches such as `promo_modal_enabled`, and the admin settings screen (feature 21) will edit that table later.

`/develop` built a first version before this decision was deliberated (recorded as `Assumed`). It works in `src/lib/flags.ts` and is already called by the listing, product, search and cart pages. This spec decides what to keep, what to change, and how the change lands without breaking the pages already using it.

## Requirements

**User stories**:
- As the store owner, I want to keep an unfinished feature hidden and switch it on when ready, without waiting for a deploy.
- As the store owner, I want to switch buying off in an incident and still take orders some other way.
- As a shopper, I never want to land on a half built page or a link that goes nowhere.

**Acceptance criteria**:
- **AC-1**: One typed list in `src/lib/flags.ts` declares exactly these 13 flags: `product_listing`, `product_detail`, `search`, `recently_viewed`, `buy`, `order_tracking`, `order_history`, `wishlist`, `compare`, `admin_catalog`, `admin_merchandising`, `admin_orders`, `admin_settings`. Each entry records its kind (`release` or `kill_switch`; only `buy` is `kill_switch`). Passing any other name to a flag helper is a type error.
- **AC-2**: Flag values come from the `Setting` row with key `feature_flags`, whose value is a JSON object of name to boolean. A missing row, a missing name, a non boolean value, or a database error all read as off. A database error is logged once per read with the flag names it affected, and never crashes the page.
- **AC-3**: A flag flipped in the database is reflected on the live site within about one minute, with no redeploy and no rebuild.
- **AC-4**: The `FLAGS` environment variable overrides the database: `FLAGS="all=on"`, `FLAGS="compare=on,buy=off"`, or both (`all=on,buy=off`, applied left to right). Unknown names are ignored with one warning. `FLAGS` is ignored, with a warning, when `VERCEL_ENV` is `production`.
- **AC-5**: A page whose flag is off returns the normal 404 page (status 404), never a partial screen.
- **AC-6**: Links that lead into an off feature are not rendered: home budget tiles, the "View all" and "All brands" links, brand tiles and product card links (`product_listing`, `product_detail`), the header cart icon (`buy`), the header Compare link (`compare`), the wishlist heart (`wishlist`), and the footer "Track your order" link (`order_tracking`). A product card without `product_detail` still shows its image, name and price, just not as a link.
- **AC-7**: A server action belonging to an off feature does nothing and returns `{ ok: false, error: "unavailable" }`. It never reads or writes data.
- **AC-8**: When `buy` is off, `/cart` and `/checkout` return 404. Product cards and the product page buy area show one "Order on WhatsApp" link whose prefilled message names the phone (and on the product page the chosen colour, storage, SKU and price) plus the product URL. Without a `whatsapp_number` setting the link becomes "Call to order" using `support_phone`; with neither, the buy area shows "Ordering opens soon".
- **AC-9**: `pnpm flag list` prints every flag with its kind, its database value and its effective value (after `FLAGS`). `pnpm flag <name> on|off` changes one flag, rejects unknown names, and refuses a non local database unless `--hosted` is passed. It prints that the change shows within about a minute.
- **AC-10**: Checking flags does not make a page dynamic: pages that were prerendered before (home, listing, product) are still prerendered in the build output.
- **AC-11**: Flags reach client components only as plain props from a server parent. No flag value is a `NEXT_PUBLIC_` variable, and no client code reads the database or `FLAGS`.

## Options considered

### Option 1: Typed list in code, values in the Setting table (the built assumption, refined)

**Pros**:
- No new service; reuses a table the admin screen will edit anyway.
- One cached read serves every flag on a page.
- A typo in a flag name fails the typecheck.

**Cons**:
- Updating a single JSON row is read, change, write, so two simultaneous flips could lose one (rare, and the script retries).
- Changes take up to about a minute because reads are cached.

### Option 2: Environment variables

**Pros**:
- Simplest; no database read.

**Cons**:
- Every change needs a redeploy, which defeats the purpose.

### Option 3: Vercel Flags SDK with Edge Config, or a hosted flag service

**Pros**:
- Fast reads, a toolbar, rich targeting.

**Cons**:
- A new service and vendor for plain on/off switches; ties flags to the host; targeting is not needed.

## Decision

**Chosen option**: Option 1: a typed list in `src/lib/flags.ts` with values in the `Setting` row `feature_flags`. Off is the default for anything missing or unreadable, `FLAGS` overrides it outside production, and `pnpm flag` flips values until the admin settings screen exists.

**Implementation skills**: `vercel-react-best-practices` (`.claude/skills/vercel-react-best-practices/`) · `prisma-client-api` (`.claude/skills/prisma-client-api/`)

## Rationale

The deciding force is "without a deploy": that rules out environment variables, and a database row the store already owns does it with no new service. Plain on/off for everyone (rather than staff preview or percentage rollout) keeps flag checks free of visitor data. That is what lets the home, listing and product pages stay prerendered under `cacheComponents`. A one minute delay is the price, and it is acceptable for switching features on, and fast enough for the `buy` kill switch.

The built assumption already got the core right (typed names, one cached read of one row, off by default, 404 when off), so it is ratified rather than replaced. The changes come from your answers.
- **Trim the list to visible features.** A flag on the stock rule or the sitemap has nothing to hide, and every flag is a branch someone must remember to delete.
- **Merge cart and checkout into `buy`.** One without the other is never useful.
- **Fail closed on database errors.** An outage must not reveal unfinished features or crash pages.
- **Use the `FLAGS` override instead of seed rows.** Tests then state what they need instead of depending on seed values.
- **WhatsApp fallback when `buy` is off.** Shoppers can still order during an incident.

Staying with a single JSON row (instead of one row per flag) keeps it to one read per page. The lost update risk on simultaneous flips is handled in the script.

## Feature design

**Data model sketch**: no schema change. `Setting` row `key = "feature_flags"`, `value = { "<flag>": true | false, ... }`. Names not in the code list are ignored. The seed writes no flag row (local dev and tests use `FLAGS`).

**Flag registry** (`src/lib/flags.ts`):
| Flag | Kind | Gates |
|---|---|---|
| `product_listing` | release | `/phones`, `/brands/[slug]`, `/collections/[slug]`, `/offers`, `/brands`, and links into them |
| `product_detail` | release | `/phones/[slug]` and product card links |
| `search` | release | `/search` results and header suggestions (the plain search form stays) |
| `recently_viewed` | release | the recently viewed row on the product page |
| `buy` | kill_switch | `/cart`, `/checkout`, cart and checkout actions, header cart icon, buy buttons |
| `order_tracking` | release | `/track` and its footer link |
| `order_history` | release | order list and detail in `/account` |
| `wishlist` | release | `/account/wishlist`, wishlist actions, heart buttons |
| `compare` | release | `/compare`, compare toggles and the Compare pill, header Compare link |
| `admin_catalog`, `admin_merchandising`, `admin_orders`, `admin_settings` | release | each admin area's pages and actions (in addition to the staff role check) |

**API surface** (server only module):
| Function | Inputs | Output | Notes |
|---|---|---|---|
| `readFlags()` | none | `Record<FlagName, boolean>` | `"use cache"`, `cacheTag("feature_flags")`, `cacheLife("minutes")`; catches database errors and returns all off |
| `getFlags()` | none | `Record<FlagName, boolean>` | `readFlags()` then the `FLAGS` override, applied outside the cache |
| `isOn(name)` | `FlagName` | `boolean` | for hiding links and choosing the buy area |
| `assertFlag(name)` | `FlagName` | `void` | calls `notFound()` when off; for pages and route handlers |
| `flagGuard(name)` | `FlagName` | `{ ok: false, error: "unavailable" } \| null` | first line of every gated server action |
| `pnpm flag list \| <name> on\|off [--hosted]` | CLI | prints values | `scripts/flag.ts`; validates against the registry; updates the row in a transaction with `SELECT ... FOR UPDATE` so simultaneous flips are not lost |

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| `readFlags` | each flag value | `Setting.value.<name>` where key is `feature_flags`; anything else is off |
| `getFlags` | override | `process.env.FLAGS`, parsed left to right; ignored when `process.env.VERCEL_ENV === "production"` |
| page gate | 404 | `notFound()` from `next/navigation` |
| link hiding | whether to render a link | `isOn(<flag>)` in the server component that renders it, passed as a prop to client children |
| WhatsApp fallback | phone number | `getStoreContact().whatsapp` (digits), else `getStoreContact().phone` for "Call to order" |
| WhatsApp fallback | message text | product name, URL (`NEXT_PUBLIC_SITE_URL` + `/phones/<slug>`), and on the product page the chosen variant's colour, storage, SKU and `formatBDT(price)` from the variant picker (spec 0006); URL encoded into `?text=` |
| `pnpm flag` | target database | `DIRECT_URL`; a non local host requires `--hosted` (same local host list as spec 0001) |
| e2e runs | flag values | `FLAGS=all=on` added to the e2e env allowlist in spec 0001 |

**Key invariants**:
- Anything not explicitly on is off.
- Flag checks never read cookies, headers or the session.
- The only permanent flag is `buy`. A `release` flag is deleted from code (and its row key) within two weeks of its feature being fully on in production.

**Security model**: flags hide features, they do not protect data. Admin areas keep their role check (`requireRole`) whether or not their flag is on. `pnpm flag --hosted` needs the hosted `DIRECT_URL`, which only the store owner holds. The WhatsApp message carries product details only, never shopper data.

**Configuration required**:
- `FLAGS`: optional override for local dev and e2e (for example `FLAGS="all=on"` in `.env.local`, documented in `.env.example`). Never set it on the hosted production site.

**Critical test scenarios**:
- Database row `{ "compare": true }` → only `compare` on; a bad value (`"yes"`) reads off, verifies **AC-2**.
- Database unreachable → all flags off, page renders, one log line, verifies **AC-2**.
- `FLAGS="all=on,buy=off"` → everything on except `buy`; `VERCEL_ENV=production` ignores it, verifies **AC-4**.
- e2e with `FLAGS="all=on,buy=off"`: `/cart` is 404, no header cart icon, the product card shows "Order on WhatsApp" with the encoded product name, verifies **AC-5**, **AC-6**, **AC-8**.
- e2e with `FLAGS="all=on,product_detail=off"`: home cards have no links, verifies **AC-6**.
- Cart action called with `buy` off returns `unavailable` and writes no row, verifies **AC-7**.
- `pnpm flag compare on` against `mobigo_test` flips the row; `pnpm flag compar on` fails listing valid names; a hosted URL without `--hosted` is refused, verifies **AC-9**.
- Build output still shows home, listing and product routes as prerendered, verifies **AC-10**.

## Build plan

Tracer Bullet, changing the built code in place so the pages that already call `assertFlag` keep working.

1. Registry: trim to the 13 flags with kinds; rename `cart` and `cod_checkout` uses to `buy`; remove flag rows from `prisma/seed.ts`; add `FLAGS="all=on"` to `.env.example`. Satisfies **AC-1**.
2. Reads: `readFlags` catches errors and returns all off with one log line; add `getFlags` with the `FLAGS` parser and production guard; `isOn`, `assertFlag` and `flagGuard` all go through `getFlags`. Unit tests for the parser, db tests for the row cases. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**.
3. Actions: add `flagGuard` as the first line of every action in `src/app/cart/actions.ts` and any other gated action. Satisfies **AC-7**.
4. Links and buy area: hide the gated links listed in AC-6 (home components, product card, header and footer); add the "Order on WhatsApp" / "Call to order" / "Ordering opens soon" buy area for cards and the product page. Header, footer and layout files belong to the other session's area, so agree the change with it first. Satisfies **AC-6**, **AC-8**, **AC-11**.
5. `scripts/flag.ts` and the `flag` package script. Satisfies **AC-9**.
6. Add `FLAGS=all=on` to the e2e env allowlist (spec 0001); e2e tests for the off cases; confirm the build output still prerenders the same routes; `pnpm typecheck` and `pnpm lint` clean. Satisfies **AC-5**, **AC-6**, **AC-8**, **AC-10**.

## Consequences

**Positive**:
- Unfinished features can ship merged but hidden, and `buy` can be switched off in an incident while orders still arrive by WhatsApp.
- Pages stay prerendered; flags cost one cached read per page.

**Negative / tradeoffs**:
- Up to about a minute between a flip and the live site.
- Every gated entry point is a branch; forgetting one leaves a link to a 404. The e2e off cases catch the main ones only.
- Removing release flags is manual discipline; stale flags pile up if nobody does it.
- Changes to the header and footer touch files another session owns.

**Neutral**:
- Renaming `cart` and `cod_checkout` to `buy` changes code another session wrote; tell that session.
- The admin settings screen (feature 21) will edit the same `feature_flags` row and must call `updateTag("feature_flags")` so changes made there show at once.

## Follow-up

- [ ] Feature 21 (admin settings): show and toggle flags, calling `updateTag("feature_flags")`.
- [ ] Spec 0001: add `FLAGS` to the e2e env allowlist (done as part of step 6 here).
- [ ] Add `FLAGS` and `pnpm flag` to root `AGENTS.md` (`/sync` owns that file).
