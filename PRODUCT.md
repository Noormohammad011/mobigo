# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shoppers in Bangladesh buying a smartphone, mostly on their own phone (mobile-first, 360px up), often on 4G and a mid-range Android. Three confirmed personas (docs/PRD.md §3):

- **Deal hunter** (early 20s, Android): wants the best price and needs to see the saving clearly. Lives in deal shelves, filters, sort, and compare.
- **Flagship buyer** (30s, iPhone): wants a genuine product, warranty, and fast delivery. Judges the product page, trust signals, and checkout.
- **Gift buyer** (40s, low tech confidence): wants a simple order and a human who calls to confirm. Uses guest checkout and tracks the order by phone number.

Second audience: **store staff/admins**, who manage brands, phones, variants, shelves, banners, settings, and the order lifecycle without a developer.

## Product Purpose

MobiGo is an online store that sells mobile phones and nothing else. The job is to let a shopper find, compare, and order the right handset (exact color × storage variant) within about 3 minutes, then pay in cash when it arrives. Staff confirm each order by phone and deliver it.

Success for the first 90 days (PRD §8): sessions-to-orders ≥ 1.5%, PENDING→CONFIRMED ≥ 80%, cart abandonment < 70%, mobile Lighthouse Performance ≥ 85 on product pages.

## Positioning

**Phone-only specialist.** General gadget stores sell phones next to laptops and appliances. MobiGo goes deeper on phones alone: full grouped spec sheets, a compare tool built for handsets, and price and stock that are exact to each variant. A store that sells everything can't credibly claim to be the phone expert. MobiGo can.

## Operating Context

- Flow: Home → brand / shelf / search → listing (filter + sort in the URL) → product → pick color + storage → Buy Now or Cart → COD checkout → confirmation → tracking.
- Order lifecycle: PENDING → (staff call the customer) → CONFIRMED → SHIPPED → DELIVERED, with CANCELLED and RETURNED as exits. Stock is reserved at PENDING.
- Shoppers search Google for "<model> price in Bangladesh". SEO landing on product and listing pages is part of how people evaluate the store.
- Contact runs through a WhatsApp link and phone calls.
- Delivery zones: Inside Dhaka (1–2 days) and Outside Dhaka (3–5 days), each with an admin-set fee.

## Capabilities and Constraints

- **Payment:** Cash on Delivery only for the MVP. Online payment (bKash, Nagad, card, EMI) is a later phase. The schema keeps a hook for it.
- **Catalog:** phones only, permanently (no accessories). New phones only (no used or refurbished). Official and unofficial variants are both sold, told apart by `warrantyType` on each variant.
- **Language and currency:** English, with prices in integer BDT (৳). Bangla is phase 2.
- **Checkout:** guest checkout is allowed. Phones use the BD format `01XXXXXXXXX`. Address is division → district → area. At most 3 pending orders per phone number. Price and stock are always re-read on the server.
- **Responsive and performance:** no horizontal scroll at 360px. Touch targets ≥ 44px. LCP < 2.5s and CLS < 0.1 on 4G mid-range Android. Listing-page JS < 170KB gzip.
- **Terminology:** "Buy Now", "Add to Cart", "Cash on Delivery", "৳X OFF" savings, "Pre-order", "Compare".
- **Open decisions:** which SMS provider sends order notifications (P1); whether phone OTP sign-in ships (P1).

## Brand Commitments

- Name: **MobiGo**, one word, capital M and G.
- Voice: short, direct, honest about price. Reference lines: "Pay when it arrives." · "৳4,000 off today."
- Visual system is recorded in docs/DESIGN_SYSTEM.md and implemented as tokens in src/app/globals.css. That file is the visual authority, not this one.

## Evidence on Hand

MobiGo will launch as a real business, but its proof assets are not in the repo yet:

- **Logo:** not delivered. A wordmark placeholder (`src/components/brand/`) stands in.
- **Outlets, contact details, warranty partners:** pending. Admins manage them as settings and CMS pages.
- **Customer reviews and testimonials:** none yet. The reviews feature collects them after launch.
- **Product imagery:** seed images in `public/seed/` are for development only.

Future work must not invent outlet addresses, review counts, ratings, testimonials, press, or partner claims. Render real data from admin and the DB, or leave a clear empty state.

## Product Principles

1. **Phone depth over catalog breadth.** Every surface should help someone choose a phone (specs, variants, compare), not imitate a general marketplace.
2. **Honest money.** Show the real price for the exact variant and the real saving. The server is the only source of truth for price and stock.
3. **No-risk ordering.** With COD and a human confirmation call, ordering should feel safe for someone with low tech confidence. Guest checkout and phone-number tracking come first.
4. **Built for the phone in the shopper's hand.** Design for 360px, 4G, and thumbs first, and scale up from there.

## Accessibility & Inclusion

WCAG 2.2 AA (PRD §6; checklist in docs/DESIGN_SYSTEM.md §8). That covers contrast, keyboard navigation, visible focus, labelled controls, `prefers-reduced-motion`, color never as the only signal, and struck prices announced as "Regular price". Some users have low tech confidence, so copy stays plain and short.
