# Reference Analysis — applegadgetsbd.com

Captured 2026-10-31 with REA `capture_browser_scenario` (headless Chrome).

| Capture | Viewport | Evidence ID |
|---|---|---|
| Home (desktop) | 1280×720 | first run (accessibility + screenshot) |
| Home → `/category/mobile-phone` → `/product/galaxy-s26-ultra-5g` | 390×844 | `ev_2aa2cf746aa53e98c6b79518537b1c75a67cc2cc9bc58a04c5d0ec724483a3a1` |

We use this site for **layout and interaction patterns only**. MobiGo uses its own brand, logo, colors, copy and product photos. No assets, text or code from the reference site go into MobiGo.

## Observed (from screenshots and the accessibility tree)

### Global shell
- **Header:** solid black bar. Logo on the left, a pill-shaped search box with a round accent-colored search button, then links (Blog, Pre-order, Offers, Compare), a round cart icon with a count badge, and a round account icon.
- **Desktop mega-nav:** a second row of top-level categories, each with a dropdown chevron.
- **Mobile header:** hamburger, logo, cart badge on the first row, full-width search on the second row. The search stays sticky.
- **Mobile bottom tab bar:** Home, Category, Offer, Sign In, with icon above label and the active tab in the accent color.
- **Floating WhatsApp button:** bottom-right on every page.
- **App-install banner (mobile):** a dismissible strip above the header with an "Open" pill CTA.
- **Promo modal on first load:** a full-image campaign banner with a close (×) button.

### Home page (top to bottom)
1. Hero carousel (7 slides, prev/next arrows, dot pagination). On desktop, two stacked promo tiles sit to the right of it.
2. Trust strip with 5 icon+label items: 36-month EMI, fastest home delivery, exchange facility, best price deals, after-sales service.
3. "Featured Categories": a grid of icon tiles (image + label).
4. Repeated **product shelves**: an H2 title, prev/next arrows, a horizontal row of filter chips (sub-categories), then a horizontal product carousel.
5. Several SEO content blocks (an H1 plus long-form H2 sections).
6. Footer: logo, phone, email, social links, outlet locations, About/Policy link columns, brand link columns (Mobile Phones: iPhone, Samsung, Google, …), copyright.

### Product card
- Rounded card (~16px radius) with a light border and a white background.
- Centered product image, then the name (1–2 lines), then the price.
- **Price block:** sale price (bold, large) and the struck-through regular price. Next to them is a green pill reading "৳ X OFF" that shows the **absolute saving**, not a percentage.
- Actions: an outlined "Shop Now" pill (buy now) and a square outlined cart icon button (add to cart).

### Category (listing) page — mobile
- Breadcrumb, then an H1 ("Mobile Phone Price in Bangladesh"), then a 2–3 line SEO intro and a "Showing: (243 Items)" count.
- Two full-width buttons: **Sort By** (outlined) and **Filter** (filled black). Filter opens a drawer.
- 2-column product grid.

### Product detail page — mobile
- Breadcrumb (Home › Mobile Phone › Brand).
- Image gallery: a large main image in a bordered rounded box, plus a horizontal thumbnail strip. The active thumbnail has an accent border.
- Brand logo on the left, "Add to Compare" in the accent color on the right.
- H1 name, then the price: cash price, a "(Cash Price)" label and the struck-through regular price.
- Availability, product code.
- **Variant selectors:** Color chips (6) and Storage chips ("12/256GB", "12/512GB", "16/1TB").
- Quantity stepper (− 1 +), "EMI Available · View Plans", WhatsApp link, and "Delivery Timescale: 3-5 Days".
- **Sticky bottom action bar (mobile):** a filled accent "Shop Now" and an outlined "Add To Cart".
- Tabs: Specification (key/value table), Description (rich content), Warranty, Reviews.
- FAQ (question H3s), Reviews ("Write a Review", empty state), Recently Viewed, Related Products.

## Inferred
- Each variant is a color × storage combination with its own price, because the price block sits next to the selectors. → MobiGo models `ProductVariant` with a price and stock for each variant.
- "Shop Now" means add to cart and go straight to checkout.
- "Pre-order" is a product state, not a separate catalog.
- Compare likely works at the variant/product level, stored client-side until sign-in.

## Unknowns (not captured)
- Filter drawer contents. The category page filters were not opened. MobiGo's filter set is a design decision; see the PRD.
- Cart, checkout and account pages (they need interaction and auth).
- Exact font family and color hex values. The DOM/CSS was not captured, and the values in the MobiGo design system are our own.
