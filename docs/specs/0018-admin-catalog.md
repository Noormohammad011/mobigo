# 0018 · Admin catalog

**Date**: 2026-10-31
**Status**: In Progress

## Summary

Staff and admins manage brands and products under `/admin`. They can create and edit phones end to end: base fields, spec values, description, images per color, and variants with SKU, price, compare at price, and stock. Saves recompute denormalized `Product` columns and revalidate storefront cache tags. Non staff users never reach admin routes.

## Context

PRD AD-2 and AD-3 require catalog CRUD before merchandising and order ops. The schema already models brands, products, colors, images, variants, and EAV specs. Storefront reads use `"use cache"` with tags `products`, `brands`, `product:{slug}`. Supabase Storage holds public product images per AGENTS.md.

## Requirements

**User stories**:
- As staff, I want to add a new phone so it appears on listing and PDP after I set status ACTIVE.
- As staff, I want to upload color images so shoppers see the right gallery.
- As staff, I want stock and prices on variants so checkout stays accurate.

**Acceptance criteria**:
- **AC-1**: Flag `admin_catalog` gates all `/admin/catalog/**` routes; off returns not found.
- **AC-2**: `requireRole(["STAFF", "ADMIN"], next)` guards every admin catalog page and server action.
- **AC-3**: Brands list, create, edit: name, slug, logo URL optional, description, featured, sort order.
- **AC-4**: Products list with search by name or slug, filter by brand and status, pagination 20.
- **AC-5**: Product edit sections: base (brand, name, slug, status, release date, descriptions, SEO fields), denormalized network and filter fields, spec values by group, colors with hex and sort, images per color via Supabase upload, variants grid (color, RAM, storage, SKU, price, compareAtPrice, stock, warranty, active flag).
- **AC-6**: On product save in one transaction: recompute `minPrice`, `maxPrice`, `maxSaving`, `ramOptionsGb`, `storageOptionsGb`, `inStock` via `classifyProduct`, plus `mainCameraMp` and `refreshRateHz` when spec 0016 helper exists, sync `SpecValue` rows from the form, sync `brandName` on product.
- **AC-7**: Image upload accepts jpeg, png, webp up to 5 MB; stores under bucket `product-images` path `{productId}/{colorId}/{uuid}.{ext}`; public URL saved on `ProductImage`.
- **AC-8**: After successful save, call `revalidateTag` for `products`, `brands`, and `product:{slug}`.
- **AC-9**: DRAFT products do not appear on storefront listings; ACTIVE and PREORDER follow existing listing rules.
- **AC-10**: Validation with zod on server; money integers BDT; slug unique.

## Options considered

### Option 1: Admin only via Supabase Studio

**Pros**: No UI build.

**Cons**: Does not meet PRD AD-2, AD-3.

### Option 2: Next.js admin app with server actions (chosen)

**Pros**: Matches stack; reuse Prisma and auth session.

**Cons**: Large form surface.

## Decision

**Chosen option**: Option 2: Next.js admin under `src/app/admin/catalog/` with server actions.

**Implementation skills**: `supabase` (storage, `.claude/skills/supabase/`), `prisma-client-api`, `vercel-react-best-practices`

## Rationale

Project already uses Supabase Auth roles from `User.role` and Prisma for catalog. Cache tag invalidation is the existing storefront pattern.

## Feature design

**Data model sketch**: Uses existing Brand, Product, ProductColor, ProductImage, ProductVariant, SpecValue models. No new tables.

**API surface**:
| Surface | Auth | Purpose |
|---|---|---|
| `/admin/catalog/brands` | STAFF+ | CRUD brands |
| `/admin/catalog/products` | STAFF+ | List products |
| `/admin/catalog/products/[id]` | STAFF+ | Edit product |
| `saveBrandAction`, `saveProductAction`, `uploadProductImageAction` | STAFF+ | Mutations |

**Value sourcing**:
| Field | Source |
|---|---|
| Variant price | Form input, validated positive int |
| Denormalized prices | Min/max/saving from active variants in transaction |
| inStock | `classifyProduct` after variant rows |
| Image URL | Supabase public URL after upload |
| Spec cell | Form map attributeId to string value |

**Key invariants**:
- Variant SKU unique.
- Raw stock updates do not bypass reservation rules (staff edit physical stock column only; reservedStock read only display in UI).

**Security model**:
- Role from `User` table only.
- Server actions verify role on every call.
- Storage uploads use server Supabase client with service role or signed upload policy per project setup (use server client with user session and RLS policy allowing STAFF role).

**Configuration required**:
- Supabase bucket `product-images` public read, authenticated write for staff (document in spec follow up if bucket missing).

**Critical test scenarios**:
- CUSTOMER role gets 404 on `/admin/catalog` → AC-2
- Save ACTIVE product appears on `/phones` after revalidate → AC-8, AC-9
- Upload rejects oversize file → AC-7

## Build plan

1. Admin shell layout and nav under `/admin` (AC-2) ✓
2. Brands CRUD (AC-3) ✓
3. Product list (AC-4) ✓
4. Product edit form base plus variants (AC-5, AC-6, AC-10) ✓
5. Spec values editor (AC-5, AC-6) ✓
6. Color images upload (AC-7) ✓
7. revalidateTag wiring (AC-8) ✓
8. Flag gate (AC-1) ✓

## Consequences

**Positive**: Unblocks merchandising and accurate catalog ops.

**Negative**: Large admin form; needs careful UX on mobile (staff may use desktop first).

**Follow up**:
- Create Supabase storage bucket and RLS if not present.
- Read only display of reservedStock on variant row.

## References

- PRD AD-2, AD-3
- `docs/SCHEMA.md` decisions 3, 6, 9
- Spec 0002 available stock rule
- Spec 0016 new spec columns
