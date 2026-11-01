import "server-only"

import { db } from "@/lib/db"
import { LISTING_PAGE_SIZE, type BatteryBand, type DisplayBand, type ListingQuery } from "@/lib/listing-params"
import { productCardSelect, toProductCard, type ProductCardData } from "@/lib/queries/home"
import { searchProductIds } from "@/lib/queries/search"
import type { Prisma } from "@/generated/prisma/client"

export type ListingResult = {
  total: number
  products: ProductCardData[]
  brands: { slug: string; name: string }[]
  chipsets: string[]
}

const DISPLAY_RANGES: Record<DisplayBand, Prisma.DecimalFilter> = {
  under6: { lt: 6 },
  "6to65": { gte: 6, lte: 6.5 },
  over65: { gt: 6.5 },
}

const BATTERY_RANGES: Record<BatteryBand, Prisma.IntFilter> = {
  under4000: { lt: 4000 },
  "4000to5000": { gte: 4000, lte: 5000 },
  over5000: { gt: 5000 },
}

const orderBy = (sort: ListingQuery["sort"]): Prisma.ProductOrderByWithRelationInput => {
  if (sort === "newest") return { createdAt: "desc" }
  if (sort === "price_asc") return { minPrice: "asc" }
  if (sort === "price_desc") return { minPrice: "desc" }
  if (sort === "saving") return { maxSaving: "desc" }
  return { name: "asc" }
}

const whereFor = (query: ListingQuery, collectionSlug?: string): Prisma.ProductWhereInput => {
  const and: Prisma.ProductWhereInput[] = []
  const wantsStock = query.availabilities.includes("in_stock")
  const wantsPreorder = query.availabilities.includes("preorder")
  if (wantsStock && !wantsPreorder) and.push({ status: "ACTIVE", inStock: true })
  else if (wantsPreorder && !wantsStock) and.push({ status: "PREORDER" })
  else if (wantsStock && wantsPreorder) and.push({ OR: [{ status: "ACTIVE", inStock: true }, { status: "PREORDER" }] })
  else and.push({ status: { in: ["ACTIVE", "PREORDER"] } })

  if (query.brandSlugs.length) and.push({ brand: { slug: { in: query.brandSlugs } } })
  if (query.minPrice != null || query.maxPrice != null) {
    and.push({
      minPrice: {
        ...(query.minPrice != null ? { gte: query.minPrice } : {}),
        ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
      },
    })
  }
  if (query.rams.length) and.push({ ramOptionsGb: { hasSome: query.rams } })
  if (query.storages.length) and.push({ storageOptionsGb: { hasSome: query.storages } })
  if (query.networks.length) and.push({ network: { in: query.networks } })
  if (query.chipsets.length) and.push({ chipsetBrand: { in: query.chipsets } })
  if (query.displays.length) and.push({ OR: query.displays.map((band) => ({ displaySizeIn: DISPLAY_RANGES[band] })) })
  if (query.batteries.length) and.push({ OR: query.batteries.map((band) => ({ batteryMah: BATTERY_RANGES[band] })) })
  if (collectionSlug) and.push({ collections: { some: { collection: { slug: collectionSlug } } } })
  if (query.productIds?.length) and.push({ id: { in: query.productIds } })
  return { AND: and }
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
