import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"
import type { Prisma } from "@/generated/prisma/client"

/** Phones released within this many days get the NEW badge. */
const NEW_FOR_DAYS = 30

/** Everything a ProductCard needs, as plain serializable data (safe to pass to client components). */
export type ProductCardData = {
  id: string
  slug: string
  name: string
  brandName: string
  price: number
  compareAtPrice: number | null
  /** Variants differ in price, so the card says "From". */
  from: boolean
  image: { url: string; alt: string } | null
  is5g: boolean
  isNew: boolean
  isPreorder: boolean
  inStock: boolean
}

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brandName: true,
  minPrice: true,
  maxPrice: true,
  network: true,
  status: true,
  inStock: true,
  releaseDate: true,
  // The cheapest active variant supplies the struck compare-at price.
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" },
    take: 1,
    select: { compareAtPrice: true },
  },
  colors: {
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: { images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } } },
  },
} satisfies Prisma.ProductSelect

type CardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>

export function toProductCard(p: CardRow, now: number): ProductCardData {
  const compareAt = p.variants[0]?.compareAtPrice ?? null
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandName: p.brandName,
    price: p.minPrice,
    compareAtPrice: compareAt && compareAt > p.minPrice ? compareAt : null,
    from: p.maxPrice > p.minPrice,
    image: p.colors[0]?.images[0] ?? null,
    is5g: p.network === "G5",
    isNew: !!p.releaseDate && now - p.releaseDate.getTime() < NEW_FOR_DAYS * 86_400_000,
    isPreorder: p.status === "PREORDER",
    inStock: p.inStock,
  }
}

/** Visible on the storefront: active or pre-order. */
const sellable = { status: { in: ["ACTIVE", "PREORDER"] } } satisfies Prisma.ProductWhereInput

/** Rows whose optional startsAt/endsAt window contains `at`. */
function scheduledAt(at: Date) {
  return {
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: at } }] },
      { OR: [{ endsAt: null }, { endsAt: { gt: at } }] },
    ],
  }
}

export type HomeBanner = { id: string; alt: string; href: string | null; mobile: string; desktop: string }

/** Hero slides and the two desktop side tiles (PRD H-1). */
export async function getHomeBanners(): Promise<{ hero: HomeBanner[]; side: HomeBanner[] }> {
  "use cache"
  cacheLife("minutes")
  cacheTag("banners")

  const rows = await db.banner.findMany({
    where: { isActive: true, placement: { in: ["HERO", "HERO_SIDE"] }, ...scheduledAt(new Date()) },
    orderBy: { sortOrder: "asc" },
  })
  const toBanner = (b: (typeof rows)[number]): HomeBanner => ({
    id: b.id,
    alt: b.alt,
    href: b.linkUrl,
    mobile: b.imageMobileUrl,
    desktop: b.imageDesktopUrl,
  })
  return {
    hero: rows.filter((b) => b.placement === "HERO").map(toBanner),
    side: rows.filter((b) => b.placement === "HERO_SIDE").slice(0, 2).map(toBanner),
  }
}

export type HomeShelf = { id: string; title: string; slug: string; products: ProductCardData[] }

/** Admin-curated collections shown on the home page, in order (PRD H-4). */
export async function getHomeShelves(): Promise<HomeShelf[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("collections", "products")

  const now = new Date()
  const collections = await db.collection.findMany({
    where: { showOnHome: true, ...scheduledAt(now) },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      items: {
        where: { product: sellable },
        orderBy: { position: "asc" },
        take: 12,
        select: { product: { select: productCardSelect } },
      },
    },
  })

  return collections
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      products: c.items.map((i) => toProductCard(i.product, now.getTime())),
    }))
    .filter((c) => c.products.length > 0)
}

export type BrandTile = { name: string; slug: string; logoUrl: string | null; phoneCount: number }

/** "Shop by Brand" tiles (PRD H-3): brands with at least one sellable phone. */
export async function getBrandTiles(): Promise<BrandTile[]> {
  "use cache"
  cacheLife("hours")
  cacheTag("brands", "products")

  const brands = await db.brand.findMany({
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true, logoUrl: true, _count: { select: { products: { where: sellable } } } },
  })
  return brands
    .filter((b) => b._count.products > 0)
    .map((b) => ({ name: b.name, slug: b.slug, logoUrl: b.logoUrl, phoneCount: b._count.products }))
}
