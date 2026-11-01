import "server-only"

import { db } from "@/lib/db"

export type CompareProductColumn = {
  id: string
  name: string
  slug: string
  minPrice: number
  imageUrl: string | null
  imageAlt: string
  valuesByAttributeId: Record<string, string>
}

export type CompareTablePayload = {
  products: CompareProductColumn[]
  droppedSlugs: string[]
  groups: {
    name: string
    attributes: { id: string; name: string; unit: string | null }[]
  }[]
}

export const getCompareTable = async (slugs: string[]): Promise<CompareTablePayload> => {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))].slice(0, 3)
  if (unique.length === 0) {
    return { products: [], droppedSlugs: [], groups: [] }
  }

  const [groups, rows] = await Promise.all([
    db.specGroup.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        name: true,
        attributes: {
          where: { isComparable: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, unit: true },
        },
      },
    }),
    db.product.findMany({
      where: { slug: { in: unique }, status: { in: ["ACTIVE", "PREORDER"] } },
      select: {
        id: true,
        name: true,
        slug: true,
        minPrice: true,
        colors: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: {
            images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
          },
        },
        specs: { select: { attributeId: true, value: true } },
      },
    }),
  ])

  const bySlug = new Map(rows.map((row) => [row.slug, row]))
  const products: CompareProductColumn[] = []
  const droppedSlugs: string[] = []

  unique.forEach((slug) => {
    const row = bySlug.get(slug)
    if (!row) {
      droppedSlugs.push(slug)
      return
    }
    const image = row.colors[0]?.images[0]
    const valuesByAttributeId: Record<string, string> = {}
    row.specs.forEach((spec) => {
      valuesByAttributeId[spec.attributeId] = spec.value
    })
    products.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      minPrice: row.minPrice,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? row.name,
      valuesByAttributeId,
    })
  })

  return {
    products,
    droppedSlugs,
    groups: groups
      .map((group) => ({ name: group.name, attributes: group.attributes }))
      .filter((group) => group.attributes.length > 0),
  }
}
