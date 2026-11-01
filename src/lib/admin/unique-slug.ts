import "server-only"

import { db } from "@/lib/db"
import { slugFromName } from "@/lib/admin/slug"

const baseSlug = (name: string, fallback: string) => {
  const slug = slugFromName(name)
  return slug.length > 0 ? slug : fallback
}

export const uniqueBrandSlug = async (name: string, excludeId?: string) => {
  const root = baseSlug(name, "brand")
  let candidate = root
  let suffix = 2
  for (;;) {
    const existing = await db.brand.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
}

export const uniqueCollectionSlug = async (title: string, excludeId?: string) => {
  const root = baseSlug(title, "collection")
  let candidate = root
  let suffix = 2
  for (;;) {
    const existing = await db.collection.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
}

export const uniqueProductSlug = async (name: string, excludeId?: string) => {
  const root = baseSlug(name, "phone")
  let candidate = root
  let suffix = 2
  for (;;) {
    const existing = await db.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
}
