"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/lib/auth/session"
import type { GuestCartLine } from "@/lib/cart/guest-cart"
import { db } from "@/lib/db"
import { getVariantAvailability } from "@/lib/stock"
import { quantityAllowed } from "@/lib/stock-rule"

export async function mergeGuestCartAction(lines: GuestCartLine[]) {
  const user = await getCurrentUser()
  if (!user || lines.length === 0) return

  const cart = await db.cart.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  for (const line of lines) {
    const variant = await db.productVariant.findUnique({ where: { id: line.variantId }, select: { price: true, isActive: true } })
    if (!variant?.isActive) continue
    const qty = Math.min(5, Math.max(1, line.quantity))
    const existing = await db.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } },
    })
    const nextQty = Math.min(5, (existing?.quantity ?? 0) + qty)
    await db.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } },
      create: { cartId: cart.id, variantId: line.variantId, quantity: nextQty, unitPrice: line.unitPrice },
      update: { quantity: nextQty },
    })
  }
  revalidatePath("/cart")
}

export async function addToCartAction(input: { variantId: string; quantity: number; unitPrice: number }) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, reason: "guest" as const }

  const [availability] = await getVariantAvailability([input.variantId])
  if (!availability || !quantityAllowed(availability.reason, availability.maxQuantity, input.quantity)) {
    return { ok: false as const, reason: "stock" as const }
  }

  const cart = await db.cart.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  const existing = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } },
  })
  const nextQty = Math.min(5, (existing?.quantity ?? 0) + input.quantity)

  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } },
    create: {
      cartId: cart.id,
      variantId: input.variantId,
      quantity: nextQty,
      unitPrice: input.unitPrice,
    },
    update: { quantity: nextQty },
  })
  revalidatePath("/cart")
  return { ok: true as const }
}

export async function updateCartQuantityAction(variantId: string, quantity: number) {
  const user = await getCurrentUser()
  if (!user) return
  const cart = await db.cart.findUnique({ where: { userId: user.id } })
  if (!cart) return
  if (quantity < 1) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, variantId } })
  } else {
    const [availability] = await getVariantAvailability([variantId])
    const capped = availability ? Math.min(5, Math.min(quantity, availability.maxQuantity)) : Math.min(5, quantity)
    await db.cartItem.updateMany({ where: { cartId: cart.id, variantId }, data: { quantity: capped } })
  }
  revalidatePath("/cart")
}

export async function removeCartLineAction(variantId: string) {
  const user = await getCurrentUser()
  if (!user) return
  const cart = await db.cart.findUnique({ where: { userId: user.id } })
  if (!cart) return
  await db.cartItem.deleteMany({ where: { cartId: cart.id, variantId } })
  revalidatePath("/cart")
}
