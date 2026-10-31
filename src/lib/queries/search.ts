import "server-only"

import { Prisma } from "@/generated/prisma/client"
import { db } from "@/lib/db"

export type SearchHit = { id: string; rank: number }

/** Full text search on Product.search, then trigram fallback on name. */
export const searchProductIds = async (query: string, limit = 100): Promise<SearchHit[]> => {
  const trimmed = query.trim()
  if (!trimmed) return []
  const fts = await db.$queryRaw<{ id: string; rank: number }[]>(
    Prisma.sql`
      SELECT p.id, ts_rank_cd(p.search, q) AS rank
      FROM "Product" p, websearch_to_tsquery('simple', ${trimmed}) AS q
      WHERE p.status IN ('ACTIVE', 'PREORDER') AND p.search @@ q
      ORDER BY rank DESC
      LIMIT ${limit}
    `
  )
  if (fts.length > 0) return fts
  const like = `%${trimmed.replace(/%/g, "")}%`
  const trigram = await db.$queryRaw<{ id: string; rank: number }[]>(
    Prisma.sql`
      SELECT id, similarity(name, ${trimmed}) AS rank
      FROM "Product"
      WHERE status IN ('ACTIVE', 'PREORDER') AND name ILIKE ${like}
      ORDER BY rank DESC
      LIMIT ${limit}
    `
  )
  return trigram
}

export type SearchSuggestion = {
  id: string
  slug: string
  name: string
  price: number
  imageUrl: string | null
}

export const searchSuggestions = async (query: string, limit = 8): Promise<SearchSuggestion[]> => {
  const hits = await searchProductIds(query, limit)
  if (hits.length === 0) return []
  const order = hits.map((hit) => hit.id)
  const rows = await db.product.findMany({
    where: { id: { in: order } },
    select: {
      id: true,
      slug: true,
      name: true,
      minPrice: true,
      colors: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } },
      },
    },
  })
  const byId = new Map(rows.map((row) => [row.id, row]))
  return order.flatMap((id) => {
    const row = byId.get(id)
    if (!row) return []
    return [
      {
        id: row.id,
        slug: row.slug,
        name: row.name,
        price: row.minPrice,
        imageUrl: row.colors[0]?.images[0]?.url ?? null,
      },
    ]
  })
}
