import "server-only"

import { db } from "@/lib/db"
import { LISTING_PAGE_SIZE, type ListingQuery } from "@/lib/listing-params"
import { productCardSelect, toProductCard, type ProductCardData } from "@/lib/queries/home"
import { searchProductIds } from "@/lib/queries/search"
import type { Prisma } from "@/generated/prisma/client"

export type ListingResult = {
  total: number
  products: ProductCardData[]
  brands: { slug: string; name: string }[]
  chipsets: string[]
}

const displayWhere = (band: ListingQuery["display"]): Prisma.DecimalFilter | undefined => {
  if (band === "under6") return { lt: 6 }
  if (band === "6to65") return { gte: 6, lte: 6.5 }
  if (band === "over65") return { gt: 6.5 }
  return undefined
}

const batteryWhere = (band: ListingQuery["battery"]): Prisma.IntFilter | undefined => {
  if (band === "under4000") return { lt: 4000 }
  if (band === "4000to5000") return { gte: 4000, lte: 5000 }
  if (band === "over5000") return { gt: 5000 }
  return undefined
}

const orderBy = (sort: ListingQuery["sort"]): Prisma.ProductOrderByWithRelationInput => {
  if (sort === "newest") return { createdAt: "desc" }
  if (sort === "price_asc") return { minPrice: "asc" }
  if (sort === "price_desc") return { minPrice: "desc" }
  if (sort === "saving") return { maxSaving: "desc" }
  return { name: "asc" }
}

const whereFor = (query: ListingQuery, collectionSlug?: string): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {
    status: query.availability === "preorder" ? "PREORDER" : query.availability === "in_stock" ? "ACTIVE" : { in: ["ACTIVE", "PREORDER"] },
  }
  if (query.availability === "in_stock") where.inStock = true
  if (query.brandSlug) where.brand = { slug: query.brandSlug }
  if (query.minPrice != null || query.maxPrice != null) {
    where.minPrice = {
      ...(query.minPrice != null ? { gte: query.minPrice } : {}),
      ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
    }
  }
  if (query.ram != null) where.ramOptionsGb = { has: query.ram }
  if (query.storage != null) where.storageOptionsGb = { has: query.storage }
  if (query.network) where.network = query.network
  if (query.chipset) where.chipsetBrand = query.chipset
  const display = displayWhere(query.display)
  if (display) where.displaySizeIn = display
  const battery = batteryWhere(query.battery)
  if (battery) where.batteryMah = battery
  if (collectionSlug) where.collections = { some: { collection: { slug: collectionSlug } } }
  if (query.productIds?.length) where.id = { in: query.productIds }
  return where
}

/** Search results: restrict listing to ranked product ids. Empty q means no id filter. */
export const getPhoneListing = async (
  query: ListingQuery,
  options?: { collectionSlug?: string; searchQuery?: string }
): Promise<ListingResult> => {
  let productIds = query.productIds
  if (options?.searchQuery?.trim()) {
    productIds = (await searchProductIds(options.searchQuery, 500)).map((hit) => hit.id)
    if (productIds.length === 0) {
      return { total: 0, products: [], brands: [], chipsets: [] }
    }
  }
  const listingQuery = productIds ? { ...query, productIds } : query
  const where = whereFor(listingQuery, options?.collectionSlug)
  const [total, rows, brands, chipsetRows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * LISTING_PAGE_SIZE,
      take: LISTING_PAGE_SIZE,
      select: productCardSelect,
    }),
    db.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    db.product.groupBy({
      by: ["chipsetBrand"],
      where: { chipsetBrand: { not: null }, status: { in: ["ACTIVE", "PREORDER"] } },
    }),
  ])
  const now = Date.now()
  const products = rows.map((row) => toProductCard(row, now))
  if (productIds && query.sort === "relevance") {
    const rank = new Map(productIds.map((id, index) => [id, index]))
    products.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
  }
  return {
    total,
    products,
    brands,
    chipsets: chipsetRows
      .map((row) => row.chipsetBrand)
      .filter((name): name is string => Boolean(name))
      .sort((a, b) => a.localeCompare(b)),
  }
}
