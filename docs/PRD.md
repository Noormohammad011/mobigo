# MobiGo — Product Requirements Document

| | |
|---|---|
| **Product** | MobiGo, an online store that sells mobile phones only |
| **Version** | v1.0 (MVP) |
| **Date** | 2026-10-31 |
| **Status** | Draft for review |
| **Related** | [Design System](./DESIGN_SYSTEM.md) · [Database Schema](./SCHEMA.md) · [Reference Analysis](./research/reference-analysis.md) |

---

## 1. Summary

MobiGo is a responsive, mobile-first e-commerce website for buying smartphones in Bangladesh. Its layout and shopping flow follow proven patterns from leading local gadget stores: a dark header, a sticky search bar, product shelves with filter chips, a variant-aware product page and a sticky buy bar. The catalog is narrowed to **mobile phones only**.

**MVP has no online payment.** Customers place an order with **Cash on Delivery (COD)**. MobiGo staff then confirm the order by phone and deliver it.

## 2. Goals & Non-Goals

### Goals
1. A shopper on a phone finds, compares and orders a handset within 3 minutes.
2. Every page is fully usable from **360px** up to **1440px+** wide.
3. Product pages handle real phone complexity: color × storage variants, each with its own price and stock, plus full spec sheets.
4. Admins manage the catalog, banners and orders without a developer.
5. Pages are SEO-ready for "<model> price in Bangladesh" searches.

### Non-Goals (MVP)
- Online payments (card, bKash, Nagad, EMI checkout). The schema leaves a clean hook for these later (see SCHEMA §6).
- Categories other than phones: no laptops, accessories or appliances.
- Multi-vendor marketplace, native mobile apps, live chat beyond a WhatsApp link.
- Multi-language. MVP is English with BDT (৳) currency. Bangla is phase 2.

## 3. Users & Personas

| Persona | Need | Key screens |
|---|---|---|
| **Rafi, deal hunter** (22, Android user) | Best price, sees savings clearly | Home deals shelf, listing filters/sort, compare |
| **Nusrat, flagship buyer** (31, iPhone user) | Genuine product, warranty, fast delivery | Product page, trust strip, checkout |
| **Karim, gift buyer** (45, low tech confidence) | Simple order, someone calls to confirm | Guest checkout, order tracking by phone number |
| **Admin / Store staff** | Add phones, set prices, process orders | Admin dashboard |

## 4. Scope — Pages & Features

Priority key: **P0** = MVP launch blocker · **P1** = MVP nice-to-have · **P2** = post-MVP

### 4.1 Global shell (all pages)
| ID | Requirement | P |
|---|---|---|
| G-1 | Dark header: logo, search, Offers, Compare, cart (with count badge), account. | P0 |
| G-2 | On mobile (<768px) the header has two rows: [menu · logo · cart] then a full-width search. The search row stays sticky on scroll. | P0 |
| G-3 | Mobile bottom tab bar with 4 tabs: Home · Brands · Offers · Account. The active tab uses the primary color. Hidden at ≥1024px. | P0 |
| G-4 | Desktop secondary nav: a brand menu (Apple, Samsung, Xiaomi, …) plus price-range shortcuts. | P0 |
| G-5 | Search with live suggestions (debounced 250ms) showing a thumbnail, name and price. Enter goes to the search results page. | P0 |
| G-6 | Floating WhatsApp contact button, positioned above the bottom tab bar. | P1 |
| G-7 | Footer: contact details, outlet list, policy links, brand link column, socials. | P0 |
| G-8 | Promo modal. An admin can toggle it, and it shows at most once per session. | P2 |

### 4.2 Home `/`
| ID | Requirement | P |
|---|---|---|
| H-1 | Hero carousel managed by admin: autoplay 5s, swipeable, dots. On desktop, 2 side promo tiles. | P0 |
| H-2 | Trust strip: Genuine Products · Fast Delivery · Cash on Delivery · Official Warranty · Easy Exchange. | P0 |
| H-3 | "Shop by Brand": a grid of brand logo tiles. | P0 |
| H-4 | Product shelves (admin-curated *collections*): New Arrivals, Best Deals, Flagships, Budget under ৳20k. Each shelf has filter chips (brand or price band) and a horizontal scroller with arrows on desktop. | P0 |
| H-5 | "Shop by Budget" tiles: <15k, 15–30k, 30–60k, 60–100k, 100k+. | P1 |
| H-6 | SEO content block, collapsible, at the page bottom. | P1 |

### 4.3 Listing pages `/phones`, `/brands/[slug]`, `/search?q=`, `/collections/[slug]`
| ID | Requirement | P |
|---|---|---|
| L-1 | Breadcrumb, H1, short intro, "Showing N items". | P0 |
| L-2 | Grid: 2 columns <640px, 3 at ≥640px, 4 at ≥1024px, 5 at ≥1280px. | P0 |
| L-3 | **Filters**: brand, price range (slider + inputs), RAM, storage, network (4G/5G), display size band, battery band, chipset brand, availability (in stock / pre-order). On mobile they open in a bottom-sheet drawer with an Apply button. On desktop they sit in a left sidebar. | P0 |
| L-4 | **Sort**: Relevance, Newest, Price ↑, Price ↓, Biggest Saving. | P0 |
| L-5 | Filter and sort state live in the URL query, so results are shareable and back-button safe. | P0 |
| L-6 | Pagination with "Load more" (mobile) or numbered pages (desktop). Page size 20. | P0 |
| L-7 | Empty state with a "Clear filters" CTA. | P0 |

### 4.4 Product card (shared component)
| ID | Requirement | P |
|---|---|---|
| C-1 | Image, name (2-line clamp), sale price, struck regular price, **savings pill showing "৳X OFF"**. | P0 |
| C-2 | Badges: New, Pre-order, Out of stock, 5G. | P0 |
| C-3 | Actions: "Buy Now" (primary outline) and an icon "Add to cart". If the phone has variants, add-to-cart opens a quick variant picker sheet. | P0 |
| C-4 | Compare toggle (icon) and Wishlist heart. | P1 |

### 4.5 Product detail `/phones/[slug]`
| ID | Requirement | P |
|---|---|---|
| P-1 | Gallery: main image, a swipeable thumbnail strip, and pinch/zoom on mobile. Changing color swaps the gallery to that color's images. | P0 |
| P-2 | Brand, name (H1), price block (sale price, regular price, savings). Price updates with the selected variant. | P0 |
| P-3 | Variant selectors: **Color** chips (swatch + name) and **Storage/RAM** chips. Unavailable combinations are disabled with a strikethrough. | P0 |
| P-4 | Availability, SKU, quantity stepper (max = stock, capped at 5), delivery estimate (Dhaka 1–2 days, outside Dhaka 3–5 days). | P0 |
| P-5 | **Sticky bottom buy bar on mobile:** Buy Now (filled) and Add to Cart (outline). On desktop the buttons appear inline. | P0 |
| P-6 | Tabs or anchored sections: Key Specs summary, Full Specification (grouped table: Display, Platform, Camera, Battery, …), Description (rich text), Warranty, Reviews. | P0 |
| P-7 | Reviews: rating summary, list, "Write a review" (signed-in buyers only, moderated). | P1 |
| P-8 | FAQ accordion per product. | P1 |
| P-9 | Related phones (same brand or price band) and Recently Viewed (stored client-side). | P0 / P1 |
| P-10 | "Add to Compare" and "Ask on WhatsApp" links. | P1 |
| P-11 | SEO: Product JSON-LD with offers, canonical URL, OG image. | P0 |

### 4.6 Compare `/compare`
| ID | Requirement | P |
|---|---|---|
| CP-1 | Compare up to 3 phones (2 on mobile) side by side, grouped by spec group, with a "highlight differences" toggle. | P1 |
| CP-2 | The compare list persists in localStorage. A floating "Compare (n)" pill appears when the list is non-empty. | P1 |

### 4.7 Cart `/cart`
| ID | Requirement | P |
|---|---|---|
| CA-1 | Line items (image, name, variant, unit price, qty stepper, remove), subtotal, delivery fee estimate, total. | P0 |
| CA-2 | Guest cart in localStorage, merged into the server cart on sign-in. | P0 |
| CA-3 | Stock is re-validated on load and at checkout. | P0 |
| CA-4 | Coupon code field. | P2 |

### 4.8 Checkout `/checkout` — COD only
| ID | Requirement | P |
|---|---|---|
| CO-1 | Guest checkout allowed. Fields: full name, phone (BD format `01XXXXXXXXX`), optional email, division → district → area, address line, optional note. | P0 |
| CO-2 | The delivery zone sets the fee (Inside Dhaka / Outside Dhaka), configured by admin. | P0 |
| CO-3 | Payment method is shown as **"Cash on Delivery"** only, as a single selected option. Copy: "Pay when you receive your phone." | P0 |
| CO-4 | Order summary. "Place Order" creates the order with status `PENDING`, reserves stock and shows a confirmation page with the order number. | P0 |
| CO-5 | Confirmation SMS/email with order number. MVP: email only if provided, SMS in P1. | P1 |
| CO-6 | Rate limiting and basic fraud checks: max 3 pending orders per phone number. | P0 |

### 4.9 Account `/account`
| ID | Requirement | P |
|---|---|---|
| A-1 | Sign up / sign in with email + password via **Supabase Auth** (name and optional BD mobile number at sign-up), email confirmation, password reset. Phone OTP in P1 (needs an SMS provider in Supabase). | P0 |
| A-2 | Order history and order detail with a status timeline. | P0 |
| A-3 | Saved addresses (CRUD, default address). | P1 |
| A-4 | Wishlist. | P1 |
| A-5 | Public order tracking `/track` using order number + phone. No login needed. | P0 |

### 4.10 Admin `/admin` (role-gated)
| ID | Requirement | P |
|---|---|---|
| AD-1 | Dashboard: today's orders, pending count, low-stock list. | P1 |
| AD-2 | Brands CRUD. | P0 |
| AD-3 | Products CRUD: base info, spec groups/items, description, images per color, variants (color × storage) with SKU, price, compare-at price and stock. | P0 |
| AD-4 | Collections (home shelves) and banners: CRUD, ordering, schedule start/end. | P0 |
| AD-5 | Orders: list with filters, detail, status change (Pending → Confirmed → Shipped → Delivered / Cancelled / Returned) with notes. Every change is written to the status history. | P0 |
| AD-6 | Reviews moderation. | P1 |
| AD-7 | Settings: delivery zones and fees, contact info, WhatsApp number, outlet list. | P0 |

### 4.11 Content pages
About, Contact, Outlets, FAQ, and the policies (Privacy, Warranty, Delivery, Return & Refund, Terms). Admin manages them as CMS pages. **P0**

## 5. Key User Flows

```
Browse → Buy
Home ─► Brand tile / Shelf / Search ─► Listing (filter+sort) ─► Product
     ─► pick Color + Storage ─► Buy Now ─► Checkout (COD) ─► Confirmation
                             └► Add to Cart ─► Cart ─► Checkout

Order lifecycle (no payment)
PENDING ─(staff calls customer)─► CONFIRMED ─► SHIPPED ─► DELIVERED
   └──────────► CANCELLED                        └──► RETURNED
Stock is reserved at PENDING, released on CANCELLED, and restocked on RETURNED.
```

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Responsive** | Mobile-first. Breakpoints are listed in the Design System §6. No horizontal scroll at 360px. Touch targets ≥44px. |
| **Performance** | LCP < 2.5s and CLS < 0.1 on a 4G mid-range Android. Images in AVIF/WebP, responsive `srcset`, lazy below the fold. JS for listing pages < 170KB gzip. |
| **SEO** | Server-rendered listing and product pages, clean slugs, sitemap.xml, robots.txt, JSON-LD (Product, BreadcrumbList, Organization, FAQPage). |
| **Accessibility** | WCAG 2.2 AA: color contrast, keyboard navigation, focus rings, labelled controls, `prefers-reduced-motion`. |
| **Security** | Credentials and sessions handled by Supabase Auth (no passwords in our DB), RLS on every table so the public Data API exposes nothing, CSRF protection, server-side validation (zod), rate-limited auth and checkout, RBAC for admin. |
| **Reliability** | Prices and stock are always read from the server at checkout; client prices are never trusted. Order creation is transactional. |
| **Analytics** | Page views, product views, add-to-cart, checkout start, order placed (privacy-friendly). |

## 7. Recommended Tech Stack (to confirm)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR for SEO-heavy product pages, plus a single codebase for storefront and admin. |
| Styling | **Tailwind CSS v4** with design tokens from the Design System | Mobile-first utilities that map 1:1 to the tokens. |
| UI primitives | Radix UI / shadcn/ui | Accessible drawer, dialog, tabs and accordion. |
| DB / ORM | **PostgreSQL + Prisma** | Relational catalog and orders. The schema is ready in SCHEMA.md. |
| Auth | **Supabase Auth** (`@supabase/ssr`) | Email + password now, phone OTP later. Roles stay in our `User` table. |
| Images | Cloudinary or S3 + Next/Image | Per-color galleries, auto format. |
| Search | Postgres full-text (`tsvector`) for MVP | Meilisearch later if needed. |
| Hosting | Vercel + Neon/Supabase Postgres | Low-ops start. |

## 8. Success Metrics (first 90 days)
- Conversion rate (sessions → orders) ≥ 1.5%
- Order confirmation rate (PENDING → CONFIRMED) ≥ 80%
- Mobile Lighthouse Performance ≥ 85 on product pages
- Cart abandonment < 70%

## 9. Release Plan

| Milestone | Contents |
|---|---|
| **M0 — Foundation** | Repo, tokens, layout shell (header, bottom nav, footer), DB + seed of 5 brands and 30 phones |
| **M1 — Browse** | Home, listing + filters/sort, search, product page |
| **M2 — Buy** | Cart, COD checkout, order confirmation, order tracking |
| **M3 — Operate** | Admin: brands, products/variants, collections/banners, orders, settings |
| **M4 — Polish** | Compare, wishlist, reviews, SEO pass, performance pass, a11y audit |

## 10. Open Questions
1. Is the stack in §7 approved, or is another stack required (e.g. Laravel, MERN)?
2. Should phone accessories (cases, chargers) ever be in scope? This affects whether we keep a generic `Category` table. The current schema is phone-only, with an easy extension point.
3. Do we need used/refurbished phones (a condition field) or only new ones?
4. Should there be official vs. unofficial variants (region/warranty type)? The schema has `warrantyType` on the variant to be safe.
5. Which SMS provider should send order notifications (P1)?
6. Brand assets: does a MobiGo logo exist yet? The Design System uses a wordmark placeholder.
