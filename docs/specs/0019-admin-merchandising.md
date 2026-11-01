# 0019 · Admin merchandising

**Date**: 2026-10-31
**Status**: Proposed

## Summary

Staff manage home shelves (`Collection` and `CollectionItem`) and marketing banners under `/admin/merchandising`. They can reorder shelf products, set collection schedule windows, and create banners with placement, images, link, sort order, and active schedule. Saves revalidate home cache tags so the storefront updates.

## Context

PRD AD-4 covers collections and banners. Models exist in Prisma. Home queries use `cacheTag("collections", "products", "banners")` in `src/lib/queries/home.ts`. Admin catalog (spec 0018) establishes the shared admin shell and role guard pattern.

## Requirements

**User stories**:
- As staff, I want to reorder phones on a home shelf so featured deals look right.
- As staff, I want to schedule a banner so campaigns start and stop on time.

**Acceptance criteria**:
- **AC-1**: Flag `admin_merchandising` gates `/admin/merchandising/**`.
- **AC-2**: Same role guard as catalog: `STAFF` or `ADMIN` only.
- **AC-3**: Collections list with title, slug, showOnHome, sortOrder, schedule; edit collection metadata.
- **AC-4**: Collection items: add product by search, remove, drag or numeric position reorder persisted as `CollectionItem.position`.
- **AC-5**: Banners list filtered by placement; create/edit title, placement enum, mobile and desktop image URLs (upload to Supabase bucket `banners` or URL fields for MVP upload), alt text, optional linkUrl, sortOrder, isActive, startsAt, endsAt.
- **AC-6**: Home page query respects `startsAt`/`endsAt` and `isActive` for banners and collections (extend home query if not already).
- **AC-7**: After save, `revalidateTag("collections")`, `revalidateTag("banners")`, and tags used by home shelves.
- **AC-8**: Deleting a collection removes items via cascade; deleting a banner is soft or hard per existing schema (hard delete row).

## Options considered

### Option 1: Edit merchandising only via seed

**Pros**: Fast.

**Cons**: Fails PRD AD-4 done when.

### Option 2: Admin UI with server actions (chosen)

**Pros**: Matches catalog admin pattern.

## Decision

**Chosen option**: Option 2: Admin merchandising UI with server actions.

**Implementation skills**: `supabase`, `prisma-client-api`, `tailwind-design-system`

## Rationale

Reuses admin shell from 0018. Schedule fields already exist on models.

## Feature design

**Data model sketch**: `Collection`, `CollectionItem`, `Banner` unchanged.

**API surface**:
| Route | Purpose |
|---|---|
| `/admin/merchandising/collections` | List |
| `/admin/merchandising/collections/[id]` | Edit items |
| `/admin/merchandising/banners` | CRUD banners |

**Value sourcing**:
| Display on home | Source |
|---|---|
| Shelf products | `CollectionItem` ordered by position, product ACTIVE |
| Banner visible | `isActive` and now between startsAt and endsAt if set |
| Hero images | `Banner.imageMobileUrl`, `imageDesktopUrl` |

**Security model**: STAFF+ only; same as catalog.

**Critical test scenarios**:
- Reorder shelf changes home order after revalidate → AC-4, AC-7
- Banner outside schedule hidden on home → AC-6

## Build plan

1. Merchandising routes and nav link (AC-1, AC-2)
2. Collections metadata CRUD (AC-3)
3. Collection item reorder and add/remove (AC-4)
4. Banners CRUD plus optional upload (AC-5)
5. Home query schedule filter if missing (AC-6)
6. revalidateTag on mutations (AC-7)

## Consequences

**Positive**: Staff control home without deploy.

**Negative**: Banner upload needs second storage bucket or shared bucket prefix.

## References

- PRD AD-4
- Spec 0018 admin catalog (shared admin shell)
