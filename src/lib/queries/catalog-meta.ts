import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"

/** Cached brand row for listing pages. */
export async function getBrandPageMeta(slug: string) {
  "use cache"
  cacheTag("brands")
  cacheLife("hours")
  return db.brand.findUnique({ where: { slug }, select: { name: true } })
}

/** Cached collection row for listing pages. */
export async function getCollectionPageMeta(slug: string) {
  "use cache"
  cacheTag("collections")
  cacheLife("hours")
  return db.collection.findUnique({ where: { slug }, select: { title: true, description: true } })
}

/** Cached product row for PDP helpers. */
export async function getProductPageMeta(slug: string) {
  "use cache"
  cacheTag("products")
  cacheTag(`product:${slug}`)
  cacheLife("hours")
  return db.product.findFirst({
    where: { slug, status: { in: ["ACTIVE", "PREORDER"] } },
    select: { name: true, slug: true },
  })
}
