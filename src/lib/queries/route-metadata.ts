import "server-only"

import type { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"
import { parseListingQuery, toListingSearch } from "@/lib/listing-params"

type Search = Record<string, string | string[] | undefined>

export async function productMetadataForRoute(params: Promise<{ slug: string }>): Promise<Metadata> {
  "use cache"
  const { slug } = await params
  cacheTag("products")
  cacheTag(`product:${slug}`)
  cacheLife("hours")
  const product = await db.product.findFirst({
    where: { slug, status: { in: ["ACTIVE", "PREORDER"] } },
    select: { name: true, slug: true },
  })
  if (!product) return { title: "Phone" }
  return {
    title: `${product.name} price in Bangladesh`,
    description: `Buy ${product.name} at MobiGo. Official warranty and cash on delivery across Bangladesh.`,
    alternates: { canonical: `/phones/${slug}` },
  }
}

export async function brandListingMetadataForRoute(
  params: Promise<{ slug: string }>,
  searchParams: Promise<Search>
): Promise<Metadata> {
  "use cache"
  const { slug } = await params
  cacheTag("brands")
  cacheLife("hours")
  const brand = await db.brand.findUnique({ where: { slug }, select: { name: true } })
  if (!brand) return { title: "Brand" }
  const query = parseListingQuery(await searchParams, { brandSlug: slug })
  const search = toListingSearch({ ...query, brandSlugs: [] })
  return {
    title: `${brand.name} phones in Bangladesh`,
    description: `Shop ${brand.name} phones at MobiGo. Cash on delivery across Bangladesh.`,
    alternates: { canonical: search ? `/brands/${slug}${search}` : `/brands/${slug}` },
  }
}

export async function collectionListingMetadataForRoute(
  params: Promise<{ slug: string }>,
  searchParams: Promise<Search>
): Promise<Metadata> {
  "use cache"
  const { slug } = await params
  cacheTag("collections")
  cacheLife("hours")
  const collection = await db.collection.findUnique({ where: { slug }, select: { title: true, description: true } })
  if (!collection) return { title: "Collection" }
  const query = parseListingQuery(await searchParams)
  const search = toListingSearch(query)
  return {
    title: collection.title,
    description: collection.description ?? collection.title,
    alternates: { canonical: search ? `/collections/${slug}${search}` : `/collections/${slug}` },
  }
}

const SEARCH_TITLE = "Search results"
const SEARCH_INTRO = "Phones matching your search."

export async function searchMetadataForRoute(searchParams: Promise<Search>): Promise<Metadata> {
  "use cache"
  cacheLife("hours")
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  return {
    title: q ? `Search: ${q}` : SEARCH_TITLE,
    description: SEARCH_INTRO,
    alternates: { canonical: q ? `/search?q=${encodeURIComponent(q)}` : "/search" },
  }
}

export async function productStaticParams(): Promise<{ slug: string }[]> {
  "use cache"
  cacheTag("products")
  cacheLife("hours")
  const rows = await db.product.findMany({
    where: { status: { in: ["ACTIVE", "PREORDER"] } },
    select: { slug: true },
  })
  return rows.map((row) => ({ slug: row.slug }))
}

export async function brandStaticParams(): Promise<{ slug: string }[]> {
  "use cache"
  cacheTag("brands")
  cacheLife("hours")
  const rows = await db.brand.findMany({ select: { slug: true } })
  return rows.map((row) => ({ slug: row.slug }))
}

export async function collectionStaticParams(): Promise<{ slug: string }[]> {
  "use cache"
  cacheTag("collections")
  cacheLife("hours")
  const rows = await db.collection.findMany({ select: { slug: true } })
  return rows.map((row) => ({ slug: row.slug }))
}
