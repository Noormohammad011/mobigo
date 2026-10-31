import "server-only"

import { db } from "@/lib/db"
import { getVariantAvailability } from "@/lib/stock"

export type CartLineView = {
  variantId: string
  quantity: number
  unitPrice: number
  livePrice: number
  maxQuantity: number
  status: "ok" | "price_changed" | "low_stock" | "out_of_stock"
  productName: string
  productSlug: string
  variantLabel: string
  imageUrl: string | null
}

const LOW_STOCK = 3

export const getCartLinesForUser = async (userId: string): Promise<CartLineView[]> => {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            select: {
              id: true,
              price: true,
              ramGb: true,
              storageGb: true,
              product: { select: { name: true, slug: true } },
              color: { select: { images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } } },
            },
          },
        },
      },
    },
  })
  if (!cart?.items.length) return []
  const ids = cart.items.map((item) => item.variantId)
  const availability = await getVariantAvailability(ids)
  return cart.items.map((item, index) => {
    const live = item.variant.price
    const avail = availability[index]
    let status: CartLineView["status"] = "ok"
    if (!avail || (avail.reason !== "ok" && avail.reason !== "preorder")) status = "out_of_stock"
    else if (item.quantity > avail.maxQuantity) status = "low_stock"
    else if (avail.reason === "ok" && avail.available <= LOW_STOCK) status = "low_stock"
    if (item.unitPrice !== live) status = status === "out_of_stock" ? status : "price_changed"
    const storage = item.variant.storageGb >= 1024 ? `${item.variant.storageGb / 1024}TB` : `${item.variant.storageGb}GB`
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      livePrice: live,
      maxQuantity: avail?.maxQuantity ?? 0,
      status,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      variantLabel: `${storage} / ${item.variant.ramGb}GB RAM`,
      imageUrl: item.variant.color.images[0]?.url ?? null,
    }
  })
}

export const getCartUnitCount = async (userId: string): Promise<number> => {
  const cart = await db.cart.findUnique({
    where: { userId },
    select: { items: { select: { quantity: true } } },
  })
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}
