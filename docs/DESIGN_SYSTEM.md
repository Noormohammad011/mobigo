# MobiGo Design System v1.0

Mobile-first. Tokens are the single source of truth: Tailwind, CSS variables and Figma all map to the names below.

> **Design language:** a dark, confident header over a clean white catalog. A single vivid brand accent marks action ("Go"), and a green accent marks savings. Rounded, touch-friendly surfaces. The layout patterns come from a study of leading gadget stores ([reference analysis](./research/reference-analysis.md)). The brand, colors and typography are MobiGo's own.

---

## 1. Brand

- **Name:** MobiGo (one word, capital M and G).
- **Wordmark (placeholder):** "Mobi" in `--color-fg-inverse` and "Go" in `--color-primary-400`, set in Plus Jakarta Sans ExtraBold (800), tracking -0.02em.
- **Voice:** short, direct, honest about price. Examples: "Pay when it arrives." · "৳4,000 off today."

## 2. Color Tokens

### 2.1 Palette (raw)

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0B0B12` | Header, footer, filled dark buttons |
| `ink-900` | `#16161F` | Hover on dark surfaces |
| `ink-700` | `#3A3A48` | Body text on white |
| `ink-500` | `#6B6B7B` | Secondary text, captions |
| `ink-300` | `#C9C9D3` | Borders (strong) |
| `ink-200` | `#E4E4EA` | Borders (default), dividers |
| `ink-100` | `#F2F2F6` | Subtle surface, skeletons |
| `ink-50`  | `#F8F8FB` | Page background (alt sections) |
| `white`   | `#FFFFFF` | Cards, page background |
| `primary-50`  | `#EEF0FF` | Selected chip background |
| `primary-100` | `#DDE1FF` | Hover tint |
| `primary-400` | `#7C84FF` | Wordmark "Go", accents on dark |
| `primary-500` | `#5B5BF6` | **Brand primary**: CTAs, active states |
| `primary-600` | `#4A45E0` | CTA hover / pressed |
| `primary-700` | `#3B35B8` | Text links on white |
| `save-50`  | `#E8FBEF` | Savings pill background |
| `save-600` | `#12A150` | Savings text, in-stock |
| `save-700` | `#0E7F3F` | Savings text on `save-50` (AA) |
| `deal-500` | `#FF7A1A` | Hot deal badge, countdowns (use sparingly) |
| `danger-500` | `#E5484D` | Errors, out of stock, remove |
| `warning-500` | `#F5A524` | Pre-order, low stock |
| `info-500` | `#3E8EF7` | Info notices |

### 2.2 Semantic tokens (use these in components)

| Semantic | Light | Dark (P2) |
|---|---|---|
| `--color-bg` | `white` | `ink-950` |
| `--color-bg-subtle` | `ink-50` | `ink-900` |
| `--color-surface` | `white` | `#1C1C27` |
| `--color-header` | `ink-950` | `ink-950` |
| `--color-fg` | `ink-950` | `#F2F2F6` |
| `--color-fg-muted` | `ink-500` | `#A0A0B0` |
| `--color-fg-inverse` | `white` | `white` |
| `--color-border` | `ink-200` | `#2A2A38` |
| `--color-border-strong` | `ink-300` | `#3A3A48` |
| `--color-primary` | `primary-500` | `primary-400` |
| `--color-primary-hover` | `primary-600` | `primary-500` |
| `--color-primary-fg` | `white` | `white` |
| `--color-save-bg` / `--color-save-fg` | `save-50` / `save-700` | `#0F2E1C` / `#4ADE80` |
| `--color-danger` | `danger-500` | `#FF6B6F` |
| `--color-danger-text` | `danger-700` | `#FF6B6F` |
| `--color-focus` | `primary-500` @ 40% ring | same |

**Contrast checks (AA):** `primary-500` on white is 4.9:1 ✓ · white on `primary-500` is 4.9:1 ✓ · `save-700` on `save-50` is 4.7:1 ✓ · `ink-500` on white is 5.2:1 ✓.

`danger-500` on white is only 3.9:1. Use it for borders, icons and fills (non-text needs 3:1), and use `danger-700` (`--color-danger-text`, 6.5:1) for error **text**. Tints: `danger-700` (`#B4232A`) and `warning-700` (`#8A5300`) are the text colors on the danger and warning badge tints.

> To re-skin, change only `primary-*` (for example, to an orange family). Every component reads the semantic tokens.

## 3. Typography

| Role | Family | Fallback |
|---|---|---|
| Display / headings / prices | **Plus Jakarta Sans** (600–800) | system-ui, sans-serif |
| Body / UI | **Inter** (400–600) | system-ui, sans-serif |
| Numbers (prices, specs) | Inter with `font-variant-numeric: tabular-nums` | |

Load both from Google Fonts with `display=swap` and the Latin subset. Use `next/font` in Next.js.

### Type scale (mobile → desktop ≥1024px)

| Token | Mobile | Desktop | Weight | Line height | Use |
|---|---|---|---|---|---|
| `display` | 28px | 40px | 800 | 1.15 | Hero headline |
| `h1` | 24px | 32px | 700 | 1.2 | Page title, product name |
| `h2` | 20px | 24px | 700 | 1.25 | Section/shelf titles |
| `h3` | 17px | 18px | 600 | 1.3 | Card group titles, FAQ question |
| `price-lg` | 26px | 30px | 800 | 1.1 | Product page price |
| `price` | 17px | 18px | 700 | 1.2 | Card price |
| `body` | 15px | 16px | 400 | 1.55 | Paragraphs |
| `body-sm` | 14px | 14px | 400 | 1.5 | Card names, table cells |
| `caption` | 12px | 12px | 500 | 1.4 | Badges, struck price, helper text |
| `overline` | 11px | 12px | 600, uppercase, +0.06em | 1.3 | Spec group labels |

## 4. Spacing, Radius, Elevation

**Spacing scale (4px base):** `0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`
- Page gutter: **16px** mobile · 24px tablet · 32px desktop. The max content width is **1280px**, centered.
- Gap between sections: 32px mobile, 56px desktop.
- Card padding: 12px mobile, 16px desktop. Grid gap: 12px mobile, 20px desktop.

**Radius**
| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8px | Inputs inside chips, thumbnails |
| `radius-md` | 12px | Buttons (square icon), inputs |
| `radius-lg` | 16px | Product cards, gallery box |
| `radius-xl` | 24px | Hero banners, bottom sheets (top corners) |
| `radius-full` | 9999px | Pill buttons, search, chips, badges |

**Elevation**
| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(11,11,18,.06)` | Cards at rest |
| `shadow-md` | `0 6px 20px rgba(11,11,18,.10)` | Card hover, dropdowns |
| `shadow-lg` | `0 16px 40px rgba(11,11,18,.18)` | Drawers, modals |
| `shadow-bar` | `0 -4px 16px rgba(11,11,18,.08)` | Sticky bottom bars |

**Z-index:** base 0 · sticky header 40 · bottom nav / buy bar 50 · floating buttons 55 · drawer 60 · modal 70 · toast 80.

**Motion:** 150ms (hover/press), 250ms (drawers, accordions), easing `cubic-bezier(.2,.8,.2,1)`. All motion respects `prefers-reduced-motion` (animations off, fades only).

## 5. Iconography & Imagery
- **Icons:** Lucide, 1.75px stroke. 20px in UI, 24px in the bottom nav and header.
- **Product images:** square 1:1 on a white background, product centered with ~8% padding. 800×800 source, served as AVIF/WebP.
- **Banners:** hero 16:9 on mobile (1080×608) and 21:9 on desktop (1920×820). Side tiles are 4:3.
- **Brand logos:** SVG, monochrome on `ink-100` tiles.

## 6. Layout & Responsive Rules

| Breakpoint | Min width | Name |
|---|---|---|
| base | 0 | Small phones (design at **360px**, test at 320px) |
| `sm` | 640px | Large phones / small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops: desktop nav appears, bottom tab bar hides |
| `xl` | 1280px | Desktops |

| Element | < 768px | 768–1023px | ≥ 1024px |
|---|---|---|---|
| Header | 2 rows: [☰ · logo · cart] + sticky search | 1 row, search grows | 1 row + brand nav row |
| Bottom tab bar | Shown (64px + safe-area inset) | Shown | Hidden |
| Product grid | 2 cols | 3 cols | 4 cols (5 at xl) |
| Shelf | Horizontal scroll-snap, 2.2 cards visible | 3.2 visible | 5 visible + arrows |
| Filters | Bottom-sheet drawer | Bottom-sheet drawer | Left sidebar 264px |
| Product page | Stacked; sticky buy bar | Stacked; sticky buy bar | 2 columns (gallery 55% / info 45%), inline buttons |
| Hero | Full-bleed carousel | Carousel | Carousel 66% + 2 stacked tiles |
| Footer | Accordion link groups | 2-column grid | 4-column grid |

Sticky elements must add `padding-bottom: env(safe-area-inset-bottom)` so they clear iOS home indicators.

## 7. Components

Each component lists its anatomy, variants, states and responsive notes. Names match the React component names.

### 7.1 `Button`
- **Variants:** `primary` (filled `--color-primary`), `dark` (filled `ink-950`), `outline` (1.5px `--color-border-strong`, transparent background), `ghost`, `link`.
- **Sizes:** `sm` 36px · `md` 44px (default, minimum touch target) · `lg` 52px (sticky buy bar).
- **Shape:** `radius-full` for text buttons, `radius-md` for square `IconButton`.
- **States:** hover (bg → `*-hover`), pressed (scale .98), focus-visible (3px `--color-focus` ring, offset 2px), disabled (40% opacity, no pointer), loading (spinner replaces the label and the width is kept).

### 7.2 `SearchBar`
- A pill input that is 44px high, white, with `radius-full`. The placeholder is "Search phones, brands…". A 36px round `primary` submit button sits inside on the right.
- A suggestion dropdown (`shadow-md`, `radius-lg`) shows up to 6 results (48px thumb, name, price) plus "See all results for '…'".
- Keyboard: ↑/↓ moves through results, Enter opens, Esc closes.

### 7.3 `Header` / `BottomNav`
- Header background is `--color-header`. Icons are white. The cart badge is an 18px `primary-500` circle with white `caption` text, placed top-right of the icon.
- BottomNav is white with a `shadow-bar` and 4 equal items (24px icon over an 11px label). The active item uses `--color-primary`; inactive items use `ink-500`.

### 7.4 `ProductCard`
```
┌──────────────────────────┐  radius-lg, 1px border, bg white
│ [5G] [NEW]          ♡ ⇄ │  badges top-left, icon actions top-right
│        ┌────────┐        │
│        │ image  │ 1:1    │
│        └────────┘        │
│ Galaxy S26 Ultra 5G      │  body-sm, 600, 2-line clamp
│ ৳116,499                 │  price, ink-950
│ ৳117,000  [৳501 OFF]     │  caption struck ink-500 + SavePill
│ [ Buy Now      ] [🛒]    │  outline pill sm + IconButton
└──────────────────────────┘
```
- **States:** hover (≥lg) lifts to `shadow-md` and slightly zooms the image (1.03). Out of stock dims the image to 60%, adds an "Out of stock" badge and replaces the CTA with a "Notify me" link (P2). Loading shows a skeleton with the same box sizes (no CLS).
- If there is no compare-at price, hide the struck price and the SavePill.
- The price shown is the **lowest variant price**, prefixed "From" when variants differ in price.

### 7.5 `SavePill` / `Badge`
- **SavePill:** `--color-save-bg` background, `--color-save-fg` text, `caption` 600, `radius-full`, padding 2×8. Text: `৳{amount} OFF`, showing absolute savings, which reads stronger for BDT prices.
- **Badge variants:** `new` (primary-50 / primary-700), `5g` (ink-950 / white), `preorder` (warning-500 tint), `out` (danger tint), `hot` (deal-500 / `ink-950`; white on deal-500 is only 2.6:1).

### 7.6 `Chip` (filter chips, variant selectors)
- 36px high, `radius-full`, 1px `--color-border`, `body-sm`.
- **Selected:** 1.5px `--color-primary` border, `primary-50` background, `primary-700` text.
- **Disabled (unavailable variant):** `ink-100` background, `ink-300` text, diagonal strike line, still focusable, with a tooltip saying "Not available in this color".
- **ColorChip:** a 20px swatch circle followed by the label. Selected adds a ring around the swatch.
- **Chip row:** horizontal scroll with scroll-snap, a fade mask at the edges and no visible scrollbar.

### 7.7 `ProductGallery`
- The main image box uses `radius-lg` and a 1px border, at a 1:1 ratio. It is swipeable on touch, and on desktop it zooms on hover (2×) with a lens.
- Thumbnails are 64px with `radius-md`. The active thumbnail gets a 2px `--color-primary` border. The strip scrolls horizontally on mobile and runs vertically on the left at ≥lg (P1).
- Dot indicator below the main image on mobile.

### 7.8 `PriceBlock`
- Shows `price-lg` sale price, then "(Cash price)" in caption muted, then the struck compare-at price and a SavePill.
- Uses an `aria-live="polite"` region so price changes are announced when the variant changes.

### 7.9 `QuantityStepper`
- A 44px high pill with − value + controls. The value is not typed; it changes only through the buttons. Min 1, max min(stock, 5).

### 7.10 `StickyBuyBar` (mobile/tablet)
- Fixed to the bottom, white, with `shadow-bar` and 12px padding plus the safe area. Two equal `lg` buttons: **Buy Now** (`primary`) and **Add to Cart** (`outline`).
- It replaces the BottomNav on the product page, so the two never stack.

### 7.11 `SpecTable`
- Grouped by spec group (`overline` group header on an `ink-50` row).
- Two columns: label (35%, `ink-500`) and value (`ink-950`). Rows are separated by 1px `--color-border`.
- **Mobile:** the label stacks above the value when the value exceeds 40 characters.

### 7.12 `FilterDrawer` / `FilterSidebar`
- **Drawer:** bottom sheet, 90vh max, `radius-xl` top, drag handle, sticky header ("Filters" + "Clear all"), sticky footer (**Show N phones** primary button).
- Each section is an accordion. Checkbox lists show a count, for example "Samsung (42)". Price is a dual-thumb slider plus two number inputs.
- Applied filters appear as removable chips above the grid.

### 7.13 `Shelf` (home product row)
- Header row: H2 on the left, "View all →" link plus prev/next round outline icon buttons (≥lg) on the right.
- Optional chip row filters the shelf client-side.
- Track: CSS scroll-snap, gap 12/20px, no layout shift while images load.

### 7.14 `HeroCarousel`
- Slides use `radius-xl` with an aspect ratio per breakpoint (see §5). Autoplay 5s pauses on hover/focus/touch. Dots are 8px, and the active dot is a 24px pill in `--color-primary`.
- Each slide is a link with the admin-supplied `alt` text. Only slide 1 is eager-loaded (priority image).

### 7.15 `TrustStrip`
- 5 items, each an icon in a 40px circle (`primary-50`) with a label. Horizontal scroll on mobile; equal columns at ≥lg on a white card with `radius-lg`.

### 7.16 Forms (`Input`, `Select`, `Textarea`)
- 48px high, `radius-md`, 1px `--color-border`, 15px text. Labels sit above in `body-sm` 600.
- **Focus:** border `--color-primary` plus the focus ring. **Error:** border `danger-500` and a helper text line with an icon.
- **Phone input:** a `+880` prefix adornment, `inputmode="tel"`, and validation against `^01[3-9]\d{8}$`.

### 7.17 Feedback
- **Toast:** bottom-center on mobile (above the nav), top-right on desktop. Variants: success, error, info. Auto-dismiss after 4s.
- **Skeletons:** `ink-100` with a shimmer, or a static block under reduced motion.
- **Empty states:** illustration slot, `h3`, one sentence, primary CTA.
- **Order status timeline:** a vertical stepper. Done steps are `save-600`, the current step is `primary-500` and future steps are `ink-300`.

### 7.18 `Footer`
- `ink-950` background with white text and `ink-300` links.
- Mobile: link groups are accordions. Order of content: contact block (phone, email, WhatsApp), outlets, Shop by Brand, Help, Policies, socials, copyright.

## 8. Accessibility Checklist
- [ ] All interactive elements are ≥44×44px.
- [ ] Focus is visible on every control, and the tab order is logical.
- [ ] Carousels can be paused, are keyboard operable and expose `aria-roledescription="carousel"`.
- [ ] Drawers and modals trap focus, close on Esc and return focus to their trigger.
- [ ] Variant chips use radio-group semantics (`role="radiogroup"`) with arrow-key navigation.
- [ ] Images have meaningful `alt`. Decorative images use `alt=""`.
- [ ] Prices are read correctly: struck prices carry the visually hidden text "Regular price".
- [ ] Color is never the only signal: savings, stock and errors also have text.

## 9. Implementation (Tailwind CSS v4 + shadcn/ui)

All tokens live in `src/app/globals.css` (CSS-first, no `tailwind.config`). shadcn/ui uses the `base-nova` style (Base UI primitives). The semantic tokens sit on shadcn's variable contract, so every generated component follows the brand automatically. A live reference of every token and component is at **`/design-system`** (not indexed).

| Token group | Utilities |
|---|---|
| Raw palette (§2.1) | `bg-ink-950`, `text-primary-700`, `bg-save-50`, `bg-deal-500`, `text-danger-700`, `text-warning-700` … |
| Semantic (§2.2) | `bg-background`, `bg-muted` (bg-subtle), `text-muted-foreground` (fg-muted), `bg-header` / `text-header-foreground`, `bg-primary` / `hover:bg-primary-hover`, `border-border` / `border-border-strong`, `bg-save` / `text-save-foreground`, `text-link`, `border-destructive`, `text-danger-text`, `ring-ring/40` (focus) |
| Type (§3) | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-price-lg`, `text-price`, `text-body`, `text-body-sm`, `text-caption`, `text-overline` (+ `uppercase`). Each sets size, line height and weight, and switches to the desktop size at `lg`. Fonts: `font-sans` (Inter), `font-display` (Plus Jakarta Sans), `font-price` (Jakarta + tabular numbers). |
| Radius / elevation (§4) | `rounded-sm` 8 · `rounded-md` 12 · `rounded-lg` 16 · `rounded-xl` 24 · `rounded-full`; `shadow-xs`, `shadow-md`, `shadow-lg`, `shadow-bar` |
| Layout & motion (§4, §6) | `page-container` (16/24/32px gutter, 1280px max), `max-w-content`, `pb-safe`, `ease-brand`, `duration-150` / `duration-250`, `scrollbar-none`, `fade-x` |
| Z-index (§4) | `z-header` 40 · `z-bar` 50 · `z-float` 55 · `z-drawer` 60 · `z-modal` 70 · `z-popover` 75 (tooltips, select menus) · `z-toast` 80 |

**Components:** shadcn primitives in `src/components/ui/` are restyled to §7 (Button sizes 36/44/52 and the `dark` variant, product Badge variants, 48px form controls, bottom-sheet Sheet, toasts). MobiGo-specific pieces are in `src/components/commerce/` (`SavePill`, `Price`, `PriceBlock`, `FilterChip`, `ChoiceChip`, `ChipRow`, `QuantityStepper`, `PhoneInput`) and `src/components/brand/` (`Wordmark`). Format money with `formatBDT()` from `src/lib/format.ts`.

**`cn`:** `src/lib/utils.ts` registers the custom `text-*`, `shadow-bar` and `z-*` names with the class merger. Add any new custom utility there too, or `cn()` may drop a conflicting class.
