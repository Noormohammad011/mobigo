import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { db } from "@/lib/db"
import { classifyProduct } from "@/lib/stock-rule"

const DEFAULT_MAX_SUBTOTAL = 300_000

export const getOrderMaxSubtotal = async (): Promise<number> => {
  const row = await db.setting.findUnique({ where: { key: "order_max_subtotal" } })
  if (row && typeof row.value === "number" && row.value > 0) return row.value
  return DEFAULT_MAX_SUBTOTAL
}

export const countPendingOrdersForPhone = async (phone: string): Promise<number> =>
  db.order.count({ where: { customerPhone: phone, status: "PENDING" } })

export const nextOrderNumber = async (): Promise<string> => {
  const rows = await db.$queryRaw<{ order_number: string }[]>`
    SELECT 'MG-' || to_char(now() AT TIME ZONE 'Asia/Dhaka', 'YYMMDD') || '-' ||
           lpad(nextval('order_number_seq')::text, 6, '0') AS order_number
  `
  const value = rows[0]?.order_number
  if (!value) throw new Error("order number sequence failed")
  return value
}

/** Conditional reserve (SCHEMA decision 6). Returns false when stock is not available. */
export const reserveVariantStock = async (tx: Prisma.TransactionClient, variantId: string, quantity: number): Promise<boolean> => {
  const updated = await tx.$executeRaw`
    UPDATE "ProductVariant"
    SET "reservedStock" = "reservedStock" + ${quantity}
    WHERE id = ${variantId}
      AND "isActive" = true
      AND stock - "reservedStock" >= ${quantity}
  `
  return updated === 1
}

export const syncProductInStock = async (tx: Prisma.TransactionClient, productId: string): Promise<void> => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { status: true, variants: { select: { stock: true, reservedStock: true, isActive: true } } },
  })
  if (!product) return
  const { inStock } = classifyProduct({ status: product.status, variants: product.variants })
  await tx.product.update({ where: { id: productId }, data: { inStock } })
}
