---
name: MobiGo
description: A phone-only store for Bangladesh. A dark frame around a bright catalog, one indigo action color, and green for savings.
colors:
  counter-ink: "#0b0b12"
  counter-ink-hover: "#16161f"
  body-ink: "#3a3a48"
  muted-ink: "#6b6b7b"
  border-strong: "#c9c9d3"
  border: "#e4e4ea"
  skeleton-mist: "#f2f2f6"
  subtle-shelf: "#f8f8fb"
  display-white: "#ffffff"
  go-indigo-tint: "#eef0ff"
  go-indigo-wash: "#dde1ff"
  go-indigo-glow: "#7c84ff"
  go-indigo: "#5b5bf6"
  go-indigo-pressed: "#4a45e0"
  go-indigo-deep: "#3b35b8"
  savings-green-tint: "#e8fbef"
  savings-green: "#12a150"
  savings-green-deep: "#0e7f3f"
  hot-deal-orange: "#ff7a1a"
  danger: "#e5484d"
  danger-text: "#b4232a"
  warning: "#f5a524"
  warning-text: "#8a5300"
  info: "#3e8ef7"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  subtitle:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
  price-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "tnum"
  price:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "tnum"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  overline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  "0.5": "2px"
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.go-indigo}"
    textColor: "{colors.display-white}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body-sm}"
  button-primary-hover:
    backgroundColor: "{colors.go-indigo-pressed}"
  button-dark:
    backgroundColor: "{colors.counter-ink}"
    textColor: "{colors.display-white}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-dark-hover:
    backgroundColor: "{colors.counter-ink-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.counter-ink}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.subtle-shelf}"
  button-lg:
    height: "52px"
    padding: "0 24px"
    typography: "{typography.body}"
  icon-button:
    rounded: "{rounded.md}"
    size: "44px"
  chip:
    backgroundColor: "{colors.display-white}"
    textColor: "{colors.counter-ink}"
    rounded: "{rounded.full}"
    height: "36px"
    typography: "{typography.body-sm}"
  chip-selected:
    backgroundColor: "{colors.go-indigo-tint}"
    textColor: "{colors.go-indigo-deep}"
  chip-disabled:
    backgroundColor: "{colors.skeleton-mist}"
    textColor: "{colors.border-strong}"
  save-pill:
    backgroundColor: "{colors.savings-green-tint}"
    textColor: "{colors.savings-green-deep}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.label}"
  badge-new:
    backgroundColor: "{colors.go-indigo-tint}"
    textColor: "{colors.go-indigo-deep}"
    rounded: "{rounded.full}"
  badge-5g:
    backgroundColor: "{colors.counter-ink}"
    textColor: "{colors.display-white}"
    rounded: "{rounded.full}"
  badge-hot:
    backgroundColor: "{colors.hot-deal-orange}"
    textColor: "{colors.counter-ink}"
    rounded: "{rounded.full}"
  product-card:
    backgroundColor: "{colors.display-white}"
    rounded: "{rounded.lg}"
    padding: "12px"
  input:
    backgroundColor: "{colors.display-white}"
    textColor: "{colors.counter-ink}"
    rounded: "{rounded.md}"
    height: "48px"
  search-bar:
    backgroundColor: "{colors.display-white}"
    rounded: "{rounded.full}"
    height: "44px"
  header:
    backgroundColor: "{colors.counter-ink}"
    textColor: "{colors.display-white}"
  bottom-nav:
    backgroundColor: "{colors.display-white}"
    textColor: "{colors.muted-ink}"
    height: "64px"
---

# Design System: MobiGo

## Overview

**Creative North Star: "The Phone Counter"**

MobiGo looks like a well-lit counter in a specialist phone shop. The dark Counter Ink frame (header, footer, dark buttons) is the shop itself. Inside it, the catalog is a bright white display case: every phone sits square on a clean background, with its real price tag beside it. There is one action color, Go Indigo, and it only shows where the shopper can *go* somewhere: buy, add, select, submit. Savings Green is kept for one job only, telling the shopper honestly how much they save.

The system is dense and practical, the way a busy counter is. It is designed first for a 360px phone held in one hand on 4G. Product grids are two columns, shelves scroll sideways with snap, filters slide up as bottom sheets, and the buy bar stays under the thumb. Components feel **tactile and thumb-friendly**: rounded pill buttons and chips, touch targets of at least 44px, cards that sit flat at rest and lift slightly on hover. Prices set the pace of the page. They use heavy display weights and tabular figures so a row of prices lines up like tags on a shelf.

Layout follows proven Bangladeshi gadget-store patterns that shoppers already know: dark header, sticky search, shelves with filter chips, a variant-aware product page. MobiGo's own identity lives in the details: its color roles, the price typography, and its restraint.

**Key Characteristics:**
- A dark Counter Ink frame around a pure white catalog.
- One action color (Go Indigo) and one honesty color (Savings Green).
- Pill-shaped buttons and chips, touch targets of at least 44px, built for thumbs.
- Prices in heavy Plus Jakarta Sans with tabular figures. Body text in Inter.
- Flat at rest. Shadows mean state (hover, floating, sticky), not decoration.
- Mobile-first: 360px is the design target and 320px is the test floor.

## Colors

One saturated action color and one saturated savings color on a cool neutral ink scale. Everything else is a status color, used in small amounts.

### Primary
- **Go Indigo** (`go-indigo`): the brand action color. Used for primary CTAs (Buy Now, Place Order, Show N phones), the active bottom-nav tab, selected-chip borders, the active carousel dot, the cart badge, the focus ring at 40%, and the current step in the order timeline. White on Go Indigo passes AA (4.9:1).
- **Go Indigo Pressed** (`go-indigo-pressed`): hover and pressed state for primary buttons.
- **Go Indigo Deep** (`go-indigo-deep`): text links on white, and text on the indigo tint (selected chips, "New" badge).
- **Go Indigo Glow** (`go-indigo-glow`): the "Go" in the wordmark and accents on dark surfaces. Becomes the primary color in the (P2) dark theme.
- **Go Indigo Tint / Wash** (`go-indigo-tint`, `go-indigo-wash`): selected-chip fill, trust-strip icon circles, hover tints.

### Secondary
- **Savings Green** (`savings-green`): in-stock text and completed timeline steps.
- **Savings Green Deep on Tint** (`savings-green-deep` on `savings-green-tint`): the SavePill, "৳X OFF" (4.7:1, AA).

### Tertiary
- **Hot Deal Orange** (`hot-deal-orange`): the "Hot" badge and countdowns only. Text on it is always Counter Ink, because white on it is just 2.6:1.

### Neutral
- **Counter Ink** (`counter-ink`): header, footer, dark buttons, headings, and the main foreground.
- **Counter Ink Hover** (`counter-ink-hover`): hover on dark surfaces.
- **Body Ink** (`body-ink`): long body copy on white.
- **Muted Ink** (`muted-ink`): secondary text, captions, struck prices, spec labels, inactive nav (5.2:1).
- **Border Strong** (`border-strong`): outline-button strokes, footer links, future timeline steps.
- **Border** (`border`): default borders and dividers on cards, inputs, chips, and table rows.
- **Skeleton Mist** (`skeleton-mist`): skeleton loaders, brand-logo tiles, disabled chips.
- **Subtle Shelf** (`subtle-shelf`): alternate section backgrounds, spec-group header rows, admin sidebar.
- **Display White** (`display-white`): page background, cards, the bottom nav.

### Status
- **Danger** (`danger`) for borders, icons, and fills. **Danger Text** (`danger-text`) for any error *text*, because Danger is only 3.9:1 on white.
- **Warning** (`warning`) for pre-order and low-stock fills. **Warning Text** (`warning-text`) for text on the warning tint.
- **Info** (`info`) for informational notices.

### Named Rules
**The Go Rule.** Go Indigo marks only places the shopper can act or the current state. It is never used as decoration, a background wash, or a heading color. If an element can't be pressed or selected, it isn't indigo.

**The Honest Green Rule.** Savings Green means "you save money" or "this is done or in stock". Never use it for generic success styling or decoration, so the shopper learns to trust it.

**The Semantic-Only Rule.** Components read semantic tokens (`bg-primary`, `text-muted-foreground`, `bg-save`), never raw hex. To re-skin the store, change only the `primary-*` family.

## Typography

**Display Font:** Plus Jakarta Sans (fallback: system-ui, sans-serif)
**Body Font:** Inter (fallback: system-ui, sans-serif)
**Price Font:** Plus Jakarta Sans with tabular figures (`font-price`)

**Character:** Plus Jakarta Sans is wide and confident, which suits headlines and prices. Inter is neutral and readable at 14–16px, which suits spec tables, forms, and body text. Both load through `next/font` with `display: swap`, Latin subset.

### Hierarchy
Sizes switch at the `lg` breakpoint (1024px). Mobile sizes are in the frontmatter.
- **Display** (800, 28px → 40px, 1.15): hero headline only.
- **Headline / H1** (700, 24px → 32px, 1.2): page titles and the product name.
- **Title / H2** (700, 20px → 24px, 1.25): section and shelf titles.
- **Subtitle / H3** (600, 17px → 18px, 1.3): card-group titles, FAQ questions, empty-state headings.
- **Price Large** (800, 26px → 30px, 1.1, tabular): product-page price.
- **Price** (700, 17px → 18px, 1.2, tabular): card price.
- **Body** (400, 15px → 16px, 1.55): paragraphs and descriptions.
- **Body Small** (400, 14px, 1.5): card names (2-line clamp, weight 600), table cells, buttons, chips, form labels (600).
- **Label / Caption** (500, 12px, 1.4): badges, struck prices, helper text.
- **Overline** (600, 11px → 12px, +0.06em, uppercase): spec-group labels.

### Named Rules
**The Price Tag Rule.** Every price uses `font-price` (Jakarta with tabular figures) and goes through `formatBDT()`. Prices are always the heaviest text in their block. A struck regular price is always Label size in Muted Ink, with visually hidden text "Regular price".

**The Two-Family Rule.** Jakarta is for headings and numbers. Inter is for everything else. Never add a third family.

## Layout

The layout is mobile-first and fluid, with a page container: 16px gutter on mobile, 24px at 768px, 32px at 1024px, centered at a 1280px maximum. Spacing follows a 4px base scale (2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80). Sections are 32px apart on mobile and 56px on desktop. Card padding is 12px → 16px. Grid gap is 12px → 20px.

Breakpoints: base 0 (design at 360px, test at 320px) · `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px.

- **Header:** under 768px it has two rows, [menu · wordmark · cart] then a sticky full-width search. From 768px it is one row with a growing search. From 1024px a brand and price-range nav row is added.
- **Bottom tab bar:** 64px plus safe-area inset, four tabs. Shown below 1024px, hidden at 1024px and up. The product page replaces it with the StickyBuyBar so the two never stack.
- **Product grid:** 2 columns → 3 at `sm` → 4 at `lg` → 5 at `xl`.
- **Shelves:** horizontal scroll-snap showing about 2.2 cards on mobile, 3.2 on tablet, and 5 plus arrow buttons on desktop.
- **Filters:** a bottom-sheet drawer below 1024px, a 264px left sidebar at 1024px and up.
- **Product page:** stacked with a sticky buy bar below 1024px. Two columns (gallery 55% / info 45%) with inline buttons at 1024px and up.
- **Hero:** full-bleed carousel on mobile. At 1024px and up, the carousel takes 66% with two stacked promo tiles beside it.

Sticky bottom elements always add `env(safe-area-inset-bottom)` padding (`pb-safe`). Layering uses named z-indexes: header 40, bars 50, floats 55, drawer 60, modal 70, popover 75, toast 80.

### Named Rules
**The 360 Rule.** Every screen is designed at 360px first and must have no horizontal page scroll at 320px. Desktop is an expansion of the mobile layout.

## Elevation & Depth

The system is flat at rest, and shadows signal state. Cards sit on white with a 1px border and at most a whisper shadow. Depth appears only when something floats (dropdowns, drawers, modals), sticks (bottom bars), or responds to hover. All shadows are cool-tinted from Counter Ink, never pure black.

### Shadow Vocabulary
- **Whisper** (`box-shadow: 0 1px 2px rgb(11 11 18 / 0.06)`): cards at rest.
- **Lift** (`box-shadow: 0 6px 20px rgb(11 11 18 / 0.1)`): product-card hover at `lg` and up, search suggestions, dropdowns.
- **Float** (`box-shadow: 0 16px 40px rgb(11 11 18 / 0.18)`): drawers, sheets, modals.
- **Bar** (`box-shadow: 0 -4px 16px rgb(11 11 18 / 0.08)`): upward shadow on the sticky bottom nav and buy bar.

### Named Rules
**The Flat-By-Default Rule.** A surface gets a shadow only when it floats, sticks, or responds to a pointer. Never stack shadows or use them decoratively.

## Shapes

Shapes are soft and touch-friendly, from a small set of corner radii: 8px (thumbnails, small inner elements), 12px (square icon buttons, inputs, gallery thumbnails), 16px (product cards, gallery box, dropdowns), 24px (hero banners, bottom-sheet top corners), and full pills (text buttons, search, chips, badges, quantity stepper). Anything you press or toggle with text in it is a pill. Anything that holds content is a rounded rectangle. Borders are 1px in the default border color. Outline buttons use a stronger 1.5px stroke. Product images are always square (1:1) with the phone centered and about 8% padding on white.

## Components

### Buttons
Tactile pills with a slight press-in.
- **Shape:** full pill for text buttons. 12px rounded square for icon buttons.
- **Sizes:** small 36px · default 44px (the minimum touch target) · large 52px (sticky buy bar). Labels are Inter 600 at Body Small, and Body at large.
- **Primary:** Go Indigo fill, white label. Hover changes to Go Indigo Pressed in 150ms with the brand ease.
- **Dark:** Counter Ink fill, white label. Hover changes to Counter Ink Hover.
- **Outline:** transparent with a 1.5px Border Strong stroke. Hover fills with Subtle Shelf. Used for Add to Cart and the card's Buy Now.
- **Ghost / Link:** ghost uses a Subtle Shelf hover. Link uses Go Indigo Deep with an underline on hover.
- **States:** pressed scales to 0.98. Focus-visible shows a 3px Go Indigo ring at 40% with a 2px offset. Disabled is 40% opacity with no pointer. Loading swaps the label for a spinner and keeps the button's width.

### Chips
Filter chips and variant selectors, 36px pills.
- **Default:** white with a 1px Border stroke, Body Small text.
- **Selected:** 1.5px Go Indigo border, Go Indigo Tint fill, Go Indigo Deep text.
- **Disabled (unavailable variant):** Skeleton Mist fill, Border Strong text, a diagonal strike. It stays focusable and its tooltip says "Not available in this color". Variant chips use radio-group semantics with arrow-key navigation.
- **Color chip:** a 20px swatch circle before the label. When selected, the swatch gets a ring.
- **Chip row:** horizontal scroll-snap, 16px fade mask at both edges, no visible scrollbar.

### SavePill & Badges
- **SavePill:** Savings Green Deep text on Savings Green Tint, Label 600 in `font-price`, pill, 2px × 8px padding. Shows the absolute saving, "৳4,000 OFF". Renders nothing when the saving is 0.
- **Badges:** New (indigo tint and deep indigo), 5G (Counter Ink and white), Pre-order (warning tint and warning text), Out of stock (danger tint and danger text), Hot (Hot Deal Orange with Counter Ink text).

### Product Card
The display-case tile.
- **Corner Style:** 16px radius, 1px Border, Display White.
- **Anatomy:** badges top-left and icon actions (wishlist, compare) top-right, then the 1:1 image, the name (Body Small 600, 2-line clamp), the price (Price, Counter Ink), the struck price with SavePill, then an outline "Buy Now" pill and an add-to-cart icon button.
- **Padding:** 12px → 16px.
- **States:** at `lg` and up, hover lifts to the Lift shadow and zooms the image to 1.03. Out of stock dims the image to 60% and adds the badge. Loading shows a skeleton at identical sizes, so there is no layout shift.
- **Price rule:** shows the lowest variant price, prefixed "From" when variant prices differ. Hide the struck price and SavePill when there is no compare-at price.

### Inputs / Fields
- **Style:** 48px high, 12px radius, 1px Border, 15px text. The label sits above in Body Small 600.
- **Focus:** the border changes to Go Indigo, plus the 40% focus ring.
- **Error:** Danger border, plus a helper line with an icon in Danger Text.
- **Phone input:** `+880` prefix, `inputmode="tel"`, validated against `^01[3-9]\d{8}$`.

### Navigation
- **Header:** Counter Ink with white 24px Lucide icons (1.75px stroke). The wordmark is "Mobi" in white and "Go" in Go Indigo Glow, set in Jakarta 800 with −0.02em tracking. The cart badge is an 18px Go Indigo circle with a white Label count.
- **Search bar:** a 44px white pill with placeholder "Search phones, brands…" and a 36px round Go Indigo submit button inside. Suggestions open in a 16px-radius dropdown with the Lift shadow (up to 6 rows, each with a 48px thumbnail, name, and price).
- **Bottom nav:** white, Bar shadow, four equal tabs (24px icon over an 11px label). Active is Go Indigo, inactive is Muted Ink.
- **Footer:** Counter Ink with white text and Border Strong links. Link groups are accordions on mobile and a 4-column grid on desktop.

### Sticky Buy Bar (signature)
The thumb-zone checkout. Fixed to the bottom below 1024px. White, Bar shadow, 12px padding plus the safe area. Two equal 52px buttons: **Buy Now** (primary) and **Add to Cart** (outline). It replaces the bottom nav on the product page.

### Price Block (signature)
Price Large sale price in `font-price`, then "(Cash price)" in muted Label, then the struck regular price and a SavePill. It sits in an `aria-live="polite"` region so a variant change announces the new price.

### Spec Table
Grouped by spec group, with an uppercase Overline header on a Subtle Shelf row. Labels take 35% in Muted Ink and values are in Counter Ink. Rows are divided by 1px Border lines. On mobile, the label stacks above the value when the value is longer than 40 characters.

### Motion
150ms for hover and press. 250ms for drawers and accordions. Easing `cubic-bezier(0.2, 0.8, 0.2, 1)` (`ease-brand`). The hero carousel autoplays every 5s and pauses on hover, focus, or touch. Under `prefers-reduced-motion`, animations are off and only opacity and color fades remain.

## Do's and Don'ts

### Do:
- **Do** use semantic tokens (`bg-primary`, `text-muted-foreground`, `bg-save`, `text-danger-text`) in components. Raw palette steps appear only where a badge, chip, or timeline spec names them.
- **Do** keep every interactive target at least 44 × 44px, and design every screen at 360px first.
- **Do** set every price in `font-price` through `formatBDT()`, and show savings as an absolute "৳X OFF" SavePill.
- **Do** use Danger Text (`#b4232a`), not Danger, for any error text, and Counter Ink text on Hot Deal Orange.
- **Do** give every surface a reduced-motion fallback and a skeleton with identical dimensions.
- **Do** pair color with text for every status (savings, stock, errors). Color is never the only signal.
- **Do** register any new custom utility in `src/lib/utils.ts` so `cn()` doesn't drop it.

### Don't:
- **Don't** hard-code hex values in components. Re-skin only by changing the `primary-*` family.
- **Don't** use Go Indigo for decoration, headings, or backgrounds. It marks action and the current state only.
- **Don't** use Savings Green for anything except savings, in-stock, or completed.
- **Don't** put white text on Hot Deal Orange (2.6:1) or Danger text on white (3.9:1).
- **Don't** add shadows to surfaces at rest beyond the Whisper shadow, and never use pure-black shadows.
- **Don't** add a third typeface or set prices in Inter.
- **Don't** stack the bottom nav and the sticky buy bar.
- **Don't** let anything cause horizontal page scroll at 320px.
