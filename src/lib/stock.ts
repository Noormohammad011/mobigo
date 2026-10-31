import "server-only"

import { db as defaultDb } from "@/lib/db"
import {
  classifyProduct,
  classifyVariant,
  type ProductAvailability,
  type ProductStatusName,
  type VariantAvailability,
} from "@/lib/stock-rule"

type StockDb = {
  productVariant: { findMany: typeof defaultDb.productVariant.findMany }
  product: { findMany: typeof defaultDb.product.findMany }
}

export type VariantStockRow = VariantAvailability & { variantId: string }
export type ProductStockRow = ProductAvailability & { productId: string }

const unique = (ids: string[]) => [...new Set(ids)]

/** Live read for one or many variants. Unknown ids, including a blank id, come back as missing. */
export const getVariantAvailability = async (
  variantIds: string[],
  client: StockDb = defaultDb
): Promise<VariantStockRow[]> => {
  if (variantIds.length === 0) return []
  const rows = await client.productVariant.findMany({
    where: { id: { in: unique(variantIds) } },
    select: {
      id: true,
      isActive: true,
      stock: true,
      reservedStock: true,
      product: { select: { status: true } },
    },
  })
  const byId = new Map(rows.map((row) => [row.id, row]))
  return variantIds.map((variantId) => {
    const row = byId.get(variantId)
    const classified = classifyVariant(
      row
        ? {
            status: row.product.status,
            isActive: row.isActive,
            stock: row.stock,
            reservedStock: row.reservedStock,
          }
        : null
    )
    return { variantId, ...classified }
  })
}

/** Live read for one or many products. A product with no variants is out of stock. */
export const getProductAvailability = async (
  productIds: string[],
  client: StockDb = defaultDb
): Promise<ProductStockRow[]> => {
  if (productIds.length === 0) return []
  const rows = await client.product.findMany({
    where: { id: { in: unique(productIds) } },
    select: {
      id: true,
      status: true,
      variants: { select: { stock: true, reservedStock: true, isActive: true } },
    },
  })
  const byId = new Map(rows.map((row) => [row.id, row]))
  return productIds.map((productId) => {
    const row = byId.get(productId)
    const classified = classifyProduct(
      row
        ? {
            status: row.status as ProductStatusName,
            variants: row.variants,
          }
        : null
    )
    return { productId, ...classified }
  })
}
